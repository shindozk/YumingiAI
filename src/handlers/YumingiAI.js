const { joinVoiceChannel, EndBehaviorType } = require('@discordjs/voice');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { pipeline } = require('stream');
const prism = require('prism-media');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { ApexListener, ApexChat } = require('apexify.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const PREFIX = 'Yumingi';

// Função para verificar e obter o caminho do FFmpeg
async function getFFmpegPath() {
    try {
        const { stdout } = await exec('which ffmpeg');
        return stdout.trim();
    } catch (error) {
        const commonPaths = [
            '/usr/bin/ffmpeg',
            '/usr/local/bin/ffmpeg',
            '/opt/homebrew/bin/ffmpeg'
        ];
        for (const p of commonPaths) {
            if (fs.existsSync(p)) return p;
        }
        throw new Error('FFmpeg não encontrado no sistema.');
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
            const recordingsDir = path.resolve(__dirname, '../handlers/recordings');
            if (!fs.existsSync(recordingsDir)) {
                fs.mkdirSync(recordingsDir, { recursive: true });
            }

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
                const sessionAudioName = `audio_${timestamp}_${member.id}.wav`;
                const sessionAudioPath = path.join(recordingsDir, sessionAudioName);

                const ffmpeg = spawn(ffmpegPath, [
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                    '-i', 'pipe:0',
                    '-f', 'wav',
                    '-ar', '16000',
                    '-ac', '1',
                    sessionAudioPath
                ]);

                ffmpeg.on('error', err => {
                    console.error('Erro no processo FFmpeg:', err);
                });

                const activeStreams = new Map();

                receiver.speaking.on('start', userId => {
                    const user = client.users.cache.get(userId);
                    if (!user || activeStreams.has(userId)) return;

                    console.log(`${user.tag} começou a falar.`);

                    const audioStream = receiver.subscribe(userId, {
                        end: {
                            behavior: EndBehaviorType.AfterSilence,
                            duration: 3000
                        }
                    });

                    if (!audioStream.readable) {
                        console.warn(`Stream de áudio inválido para ${user.tag}.`);
                        return;
                    }

                    const opusDecoder = new prism.opus.Decoder({
                        rate: 48000,
                        channels: 2,
                        frameSize: 960
                    });

                    activeStreams.set(userId, audioStream);

                    pipeline(audioStream, opusDecoder, ffmpeg.stdin, err => {
                        if (err) {
                            if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
                                console.warn(`Stream encerrado prematuramente para ${user.tag}.`);
                            } else {
                                console.error(`Erro ao processar áudio de ${user.tag}:`, err);
                            }
                        }
                        activeStreams.delete(userId);
                        if (!ffmpeg.stdin.destroyed) {
                            ffmpeg.stdin.end();
                        }
                    });
                });

                interaction.reply({ content: 'Gravação iniciada!', ephemeral: true });

                ffmpeg.on('close', async code => {
                    if (code === 0) {
                        console.log(`Áudio gravado em: ${sessionAudioPath}`);

                        if (!fs.existsSync(sessionAudioPath)) {
                            return interaction.followUp({ content: 'Erro: O arquivo de gravação não foi encontrado.', ephemeral: true });
                        }

                        try {
                            // Transcrever áudio para texto
                            const relativeAudioPath = path.relative(process.cwd(), sessionAudioPath);

                            const options = {
                                filepath: relativeAudioPath,
                                model: 'gemini-pro',
                                prompt: 'Fale usando o idioma identificado do audio, o inglês não será mais o padrão e também melhore ou adapte o texto caso não der para entender.'
                            };

                            const response = await ApexListener(options);
                            const transcribedText = response.transcribe;

                            console.log(`Transcrição: ${transcribedText}`)

                            // Enviar transcrição
                            await interaction.followUp({ content: `Transcrição: ${transcribedText}`, ephemeral: true });

                            // Enviar texto para o chatbot
                            const chatOptions = {
                                userId: member.id,
                                memory: true,
                                limit: 12,
                                instruction: 'Você é um assistente amigável. Seu nome é Yumingi.'
                            };

                            const chatResponse = await ApexChat('v3', transcribedText, chatOptions);

                            console.log(`Chatbot: ${chatResponse}`)

                            // Enviar resposta do chatbot
                            await interaction.followUp({ content: `Chatbot: ${chatResponse}`, ephemeral: true });

                            // Excluir o arquivo de áudio após todo o processamento
                            fs.unlinkSync(sessionAudioPath);
                            console.log(`Áudio ${sessionAudioPath} excluído.`);
                        } catch (error) {
                            console.error('Erro ao processar áudio/chatbot:', error);
                            await interaction.followUp({ content: 'Erro ao processar o áudio/chatbot.', ephemeral: true });
                        }
                    } else {
                        console.error(`FFmpeg terminou com código ${code}`);
                        await interaction.followUp({ content: 'Erro ao processar a gravação de áudio.', ephemeral: true });
                    }
                });

            } else if (customId === 'stop_record') {
                if (!connections.has(guild.id)) {
                    return interaction.reply({ content: 'Não há gravação em andamento!', ephemeral: true });
                }

                const connection = connections.get(guild.id);
                connection.destroy();
                connections.delete(guild.id);
                interaction.reply({ content: 'Gravação finalizada!', ephemeral: true });
            }
        });

        client.on('messageCreate', message => {
            if (message.content.toLowerCase().startsWith(`${PREFIX.toLowerCase()} button`)) {
                const embed = new EmbedBuilder()
                    .setTitle('Controle de Gravação')
                    .setDescription('Use os botões abaixo para iniciar ou parar a gravação.')
                    .setColor('#a600ff');

                const row = new ActionRowBuilder()
                    .addComponents(
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