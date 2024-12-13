const Discord = require('discord.js');
const os = require('os');
const osu = require('node-os-utils');
const diskinfo = require('node-disk-info');
const { mem, cpu } = osu; 

exports.command = {
    data: new Discord.SlashCommandBuilder()
    .setName('appinfo')
    .setDescription('[Informação] - Exibe as informações de CPU, RAM, disco e diversas outras sobre a aplicação.'),
    cooldown: 5000,
    directory: 'Information',
    ownerOnly: false,
    isCommandOffline: false,
    async execute(client, interaction) {
        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setColor('#a600ff')
            .setDescription('Selecione uma categoria de informações usando o menu abaixo. Estou ansiosa para mostrar o que sei!')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId('appinfo-category')
                .setPlaceholder('Selecione a categoria de informações')
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions([
                    { label: 'Processamento', value: 'processing' },
                    { label: 'Informações Diversas', value: 'misc' },
                    { label: 'Contatos', value: 'contacts' }
                ]),
        );

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.isStringSelectMenu() && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async m => {
            if (m.customId === 'appinfo-category') {
                await m.deferUpdate();

                let embed;
                const category = m.values[0];

                if (category === 'processing') {
                    const memInfo = await mem.info();
                    const cpuUsage = await cpu.usage();
                    const driveInfo = diskinfo.getDiskInfoSync();

                    embed = new Discord.EmbedBuilder()
                        .setTitle('✨ Informações de Processamento ✨')
                        .setColor('#a600ff')
                        .addFields(
                            { name: '🖥️ CPU', value: `${os.cpus().length} x ${os.cpus()[0].model}`, inline: true },
                            { name: '⚙️ Uso de CPU', value: `${cpuUsage.toFixed(2)}%`, inline: true },
                            { name: '💾 Memória RAM Total', value: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`, inline: true },
                            { name: '📊 Memória RAM Livre', value: `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`, inline: true },
                            { name: '📈 Uso de Memória RAM', value: `${memInfo.usedMemMb} MB / ${memInfo.totalMemMb} MB (${memInfo.usedMemPercentage}%)`, inline: true },
                            { name: '💽 Disco Total', value: `${(driveInfo[0].blocks / (1024 ** 3)).toFixed(1)} GB`, inline: true },
                            { name: '💿 Disco Livre', value: `${(driveInfo[0].available / (1024 ** 3)).toFixed(1)} GB`, inline: true }
                        )
                        .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();
                } else if (category === 'misc') {
                    embed = new Discord.EmbedBuilder()
                        .setTitle('🎉 Informações Diversas 🎉')
                        .setColor('#a600ff')
                        .addFields(
                            { name: '🌐 Plataforma', value: `${os.platform()}`, inline: true },
                            { name: '🖥️ OS', value: `${os.type()} ${os.release()}`, inline: true },
                            { name: '🏗️ Arquitetura', value: `${os.arch()}`, inline: true },
                            { name: '🏠 Hostname', value: `${os.hostname()}`, inline: true },
                            { name: '⏳ Uptime', value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`, inline: true }
                        )
                        .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();
                } else if (category === 'contacts') {
                    embed = new Discord.EmbedBuilder()
                        .setTitle('📞 Contatos 📞')
                        .setColor('#a600ff')
                        .setDescription('Aqui estão algumas formas de entrar em contato com os desenvolvedores do bot:')
                        .addFields(
                            { name: '🛠️ Suporte', value: `[Clique aqui](${client.config.supportURL})`, inline: true },
                            { name: '🚀 Convidar', value: `[Clique aqui](${client.config.inviteURL})`, inline: true }
                        )
                        .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();
                }

                await m.editReply({ embeds: [embed] });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const timedEmbed = new Discord.EmbedBuilder()
                    .setTitle('⏰ Tempo Esgotado ⏰')
                    .setColor('#a600ff')
                    .setDescription('O menu de informações expirou. Use `/appinfo` para visualizar as informações novamente.')
                    .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await interaction.editReply({ embeds: [timedEmbed], components: [] }).then(() => {
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 30000);
                });
            }
        });
    },
};