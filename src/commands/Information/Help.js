const Discord = require("discord.js");
const fs = require('fs');
const path = require('path');

const commandsPath = "src/commands/";

exports.command = {
    data: new Discord.SlashCommandBuilder()
    .setName('help')
    .setDescription('[Informação] - Exibe a lista de todos os comandos da aplicação.'),
    cooldown: 5000,
    directory: 'Information',
    ownerOnly: false,
    isCommandOffline: false,
    async execute(client, interaction) {
        const commandFolders = fs.readdirSync(commandsPath);
        const categories = commandFolders.filter(dir => !dir.startsWith('.'));

        const embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setColor('#a600ff')
            .setImage(client.config.imageURL)
            .setDescription(
                `Olá **${interaction.user.username}**! Eu sou **${client.user.username}**, seu adorável bot de música! 🎶 Eu adoro tocar suas músicas favoritas do Spotify, SoundCloud, YT Music e muito mais. Vamos descobrir o que eu posso fazer? Use o menu abaixo para explorar!`,
            )
            .addFields({
                name: 'Comandos registrados:',
                value: `**${client.slashCommands.size}**`,
                inline: false,
            })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId("help-category")
                .setPlaceholder(`Escolha uma categoria de comandos`)
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions(
                    categories.map(category => ({
                        label: category,
                        value: category
                    }))
                ),
        );

        const row2 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Suporte")
                    .setURL(client.config.supportURL)
                    .setStyle(Discord.ButtonStyle.Link),
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Convidar")
                    .setURL(client.config.inviteURL)
                    .setStyle(Discord.ButtonStyle.Link),
            );

        await interaction.reply({ embeds: [embed], components: [row, row2] });

        const filter = i => i.isStringSelectMenu() && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on("collect", async m => {
            if (m.customId === "help-category") {
                await m.deferUpdate();

                const [directory] = m.values;

                const commands = Array.from(client.slashCommands.values()).filter(cmd => cmd.directory === directory);

                if (commands.length === 0) {
                    const noCommandsEmbed = new Discord.EmbedBuilder()
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                        })
                        .setDescription(`Ops! Parece que não há comandos disponíveis na categoria **${directory}**. 😅`)
                        .setColor('#a600ff')
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    await m.editReply({ embeds: [noCommandsEmbed] });
                    return;
                }

                const categoryEmbed = new Discord.EmbedBuilder()
                    .setAuthor({
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                    })
                    .setDescription(
                        `Aqui estão todos os comandos disponíveis na categoria **${directory.charAt(0).toUpperCase() + directory.slice(1)}**. Adicione [\`/\`] antes dos comandos ou clique neles diretamente abaixo. Vamos lá! 🚀\n\n**❯ Comandos:**`
                    )
                    .setColor('#a600ff')
                    .setImage(client.config.imageURL)
                    .addFields(commands.map(c => ({
                        name: `\`/${c.data.name}\``,
                        value: `*${c.data.description}*`,
                        inline: false
                    })))
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await m.editReply({ embeds: [categoryEmbed] });
            }
        });

        collector.on("end", async (collected, reason) => {
            if (reason === "time") {
                const timedEmbed = new Discord.EmbedBuilder()
                    .setAuthor({
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                    })
                    .setDescription(
                        `Parece que o menu de ajuda expirou. Não se preocupe, você pode usar \`/help\` para chamá-lo novamente. Até logo! 👋`,
                    )
                    .setColor('#a600ff')
                    .addFields({
                        name: 'Comandos registrados:',
                        value: `**${client.slashCommands.size}**`,
                        inline: false,
                    })
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await interaction.editReply({ embeds: [timedEmbed], components: [row2] }).then(() => {
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 30000);
                });
            }
        });
    },
};