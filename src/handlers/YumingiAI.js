const { 
    joinVoiceChannel, 
    EndBehaviorType, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus 
} = require('@discordjs/voice');
const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder 
} = require('discord.js');
const { pipeline } = require('stream');
const prism = require('prism-media');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');
const { ApexListener, ApexChat } = require('apexify.js');
const { QuickDB } = require("quick.db");

const db = new QuickDB();
const PREFIX = 'Yumingi';

// Função para localizar o FFmpeg
async function getFFmpegPath() {
    try {
        const { stdout } = await exec('which ffmpeg');
        return stdout.trim();
    } catch {
        const commonPaths = ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
        for (const p of commonPaths) if (fs.existsSync(p)) return p;
        throw new Error('FFmpeg não encontrado.');
    }
}

module.exports = {
    async execute(client) {
        const connections = new Map();
        let ffmpegPath;

        try {
            ffmpegPath = await getFFmpegPath();
        } catch (error) {
            console.error('Erro ao localizar FFmpeg:', error);
            return;
        }

        client.on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;

            const { guild, member, customId } = interaction;
            if (!guild || !member.voice.channel) {
                return interaction.reply({ content: 'Você precisa estar em um canal de voz!', ephemeral: true });
            }

            const voiceChannel = member.voice.channel;

            if (customId === 'start_record') {
                if (connections.has(guild.id)) {
                    return interaction.reply({ content: 'Já existe uma gravação em andamento!', ephemeral: true });
                }

                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    selfDeaf: false
                });

                const receiver = connection.receiver;
                connections.set(guild.id, connection);

                const now = new Date();
                const timestamp = now.toISOString().replace(/:/g, '-');

                const activeStreams = new Map();

                receiver.speaking.on('start', userId => {
                    const user = client.users.cache.get(userId);
                    if (!user || activeStreams.has(userId)) return;

                    const audioStream = receiver.subscribe(userId, {
                        end: { behavior: EndBehaviorType.AfterSilence, duration: 3000 }
                    });

                    const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
                    activeStreams.set(userId, audioStream);

                    pipeline(audioStream, opusDecoder, err => {
                        if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
                            console.error(`Erro ao gravar áudio de ${user.tag}:`, err);
                        }
                        activeStreams.delete(userId);
                    });
                });

                interaction.reply({ content: 'Gravação iniciada!', ephemeral: true });

                receiver.speaking.on('end', async userId => {
                    if (!activeStreams.has(userId)) return;

                    try {
                        // Transcrever o áudio
                        const { response } = await ApexListener({
                            filepath: `temp_${timestamp}.wav`, // Exemplo fictício
                            lang: 'pt',
                            model: 'gemini-pro'
                        });

                        const transcribedText = response.transcribe;

                        await interaction.followUp({ content: `Transcrição: ${transcribedText}`, ephemeral: true });

                        // Enviar ao chatbot
                        const chatResponse = await ApexChat('v3', transcribedText, {
                            userId: member.id,
                            memory: true,
                            limit: 12,
                            instruction: 'Você é uma IA amigável e divertida chamada Yumingi.'
                        });

                        // Gerar link do TTS
                        const ttsResponse = await axios.request({
                            method: 'POST',
                            url: 'https://realistic-text-to-speech.p.rapidapi.com/v3/generate_voice_over_v2',
                            headers: {
                                'x-rapidapi-key': '195d9d56f0mshf2ef5b15de50facp11ef65jsn7dbd159005d4',
                                'x-rapidapi-host': 'realistic-text-to-speech.p.rapidapi.com',
                                'Content-Type': 'application/json'
                            },
                            data: {
                                voice_obj: {
                                    id: 2057,
                                    voice_id: 'pt-BR-Neural2-C',
                                    gender: 'Female',
                                    language_code: 'pt-BR',
                                    language_name: 'Portuguese',
                                    voice_name: 'Camila',
                                    sample_text: chatResponse
                                },
                                json_data: [
                                    {
                                        block_index: 0,
                                        text: chatResponse
                                    }
                                ]
                            }
                        });

                        const audioLink = ttsResponse.data[0].link;

                        // Adicionar tempo de espera antes de reproduzir o áudio
                        setTimeout(() => {
                            // Reproduzir áudio pelo link
                            const player = createAudioPlayer();
                            connection.subscribe(player);
                            player.play(createAudioResource(audioLink));

                            player.on(AudioPlayerStatus.Idle, () => console.log('Resposta concluída.'));
                        }, 5000); // Espera de 5 segundos para o TTS ser gerado

                    } catch (error) {
                        console.error('Erro:', error);
                        interaction.followUp({ content: 'Erro ao processar o áudio/chatbot.', ephemeral: true });
                    }
                });
            } else if (customId === 'stop_record') {
                if (!connections.has(guild.id)) {
                    return interaction.reply({ content: 'Nenhuma gravação em andamento.', ephemeral: true });
                }

                const connection = connections.get(guild.id);
                connection.destroy();
                connections.delete(guild.id);
                interaction.reply({ content: 'Gravação finalizada!', ephemeral: true });
            }
        });

        client.on('messageCreate', message => {
            if (message.content.toLowerCase() === `${PREFIX.toLowerCase()} button`) {
                const embed = new EmbedBuilder()
                    .setTitle('Controle de Gravação')
                    .setDescription('Use os botões abaixo para iniciar ou parar a gravação.')
                    .setColor('#a600ff');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('start_record')
                        .setLabel('Iniciar Gravação')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('stop_record')
                        .setLabel('Parar Gravação')
                        .setStyle(ButtonStyle.Danger)
                );

                message.channel.send({ embeds: [embed], components: [row] });
            }
        });
    }
};
