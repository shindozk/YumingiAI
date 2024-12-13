const Discord = require("discord.js");

exports.command = {
    data: new Discord.SlashCommandBuilder()
    .setName('changelogs')
    .setDescription('[Information] - Exibe as atualizações e mudanças entre versões da aplicação.'),
    cooldown: 5000,
    directory: 'Information',
    ownerOnly: false,
    isCommandOffline: false,
    async execute(client, interaction) {
        const changelogs = [
            { title: 'V: 2.7.0 | *Comemorando 3 anos de aniversário da Yoruka! Desenvolvendo nova base e sistema mais instavel, adicionando database, distube, lofi 24h7d, rank, coins e muito mais! (**/05/2024)', description: 'Sistema em desenvolvimento, lançamento em breve...' },
            { title: 'V: 2.6.0 | Algumas correções e otimizações. Comandos adicionados. (26/03/2024)', description: '[Sistema] Comando de ***searchyt*** adicionado e correções na instabilidade das opções do player.' },
            { title: 'V: 2.5.0 | Sistema praticamente finalizado. Lançamento da versão oficial. (29/09/2023)', description: '- [Sistema] Sistema reconfigurado completamente. Muitas funções adicionadas. Comandos sendo adicionados.' },
            { title: 'V: 2.4.5 | Problemas com a host e perda dos arquivos. Sistema completamente refeito do zero com aprimoramentos e otimizações. Especial 2 anos do inicio do desenvolvimento da Yoruka. (12/08/2023)', description: '- [Logs] Desenvolvedor: Oi! Sou o Crone, o criador da Yoruka, venho aqui informar que tive alguns problemas com a hospedagem e backup dos arquivo do sistema, em Maio desse ano, conclui uma nova versão da Yoruka completa, a mais perfeita de todas, mais devido a hospedagem o sevidor foi resetado e eu não tinha feito o backup dos arquivo, então perdi todo o sistema, agora finalmente estou refazendo ele do zero novamente igual a versão que eu tinha feito anteriormente, só que mais melhorada, então estou terminando os acabamentos do sistema e logo vou lançar no bot oficial. Atenciosamente, CroneGamesPlays. **Aviso importante:** Este erro não será mais cometido, já fiz procedimentos de segurança em backups.' },
            { title: 'V: 2.2.5 | Novo sistema com Slash Commands permanente adicionado. *Comemorando o 1 ano de aniversário da Yoruka!! 🎉 Feliz aniversário... (01/06/2022)', description: '- [Sistema] Slash Commands adicionado, agora os prefixos do bot foram retirados para sempre. Também vários comandos foram adicionados. Usando a package *discord-player*.' },
            { title: 'V: 2.2.0 | Sistema novo adicionado. (05/03/2022)', description: '- [Sistema] Sistema trocado novamente para um novo. Usando a package *distube*.' },
            { title: 'V: 2.0.0 | Sistema trocado. (05/07/2021)', description: '- [Sistema] Comandos adicionados e sistema trocado para um novo. Usando a package *ytdl-core*. Novo prefixo: yk!' },
            { title: 'V: 1.5.0 | Comandos adicionados e sistema trocado. (16/06/2021)', description: '- [Sistema] O sistema foi totalmente trocado por um novo e funcionando com y!play nome da música. Usando a package *discord-player*. - [Adicionados] ***y!queue*** adicionado.' },
            { title: 'V: 1.0.0 | Iniciando o desenvolvimento do bot. (21/05/2021)', description: '- [Criando o sistema do zero] Comandos de ***y!play***, ***y!stop***, ***y!skip*** adicionados. - [Sistema] Comando de ***y!play*** somente com links das músicas do YouTube e não funciona com titulo de músicas. Exemplo: y!play link-do-youtube - Nota: Usando a package *ytdl-core* e *discord.js* na v12.' }
        ];

        const itemsPerPage = 5;
        const totalPages = Math.ceil(changelogs.length / itemsPerPage);
        let currentPage = 1;

        const generateEmbed = (page) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            const embed = new Discord.EmbedBuilder()
                .setTitle(`📜 Changelogs - Versão atual: ${client.config.YorukaVersion}📜`)
                .setColor('#a600ff')
                .setFooter({ text: `Página ${page} de ${totalPages} - © ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios - Criado com amor e carinho pelo developer: Crone Games Plays (cronegamesplays) ❤️`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            changelogs.slice(start, end).forEach(log => {
                embed.addFields({ name: log.title, value: log.description });
            });

            return embed;
        };

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('previous')
                .setLabel('⬅️')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId('page')
                .setLabel(`${currentPage}/${totalPages}`)
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(true),
            new Discord.ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️')
                .setStyle(Discord.ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [generateEmbed(currentPage)], components: [row] });

        const filter = i => i.isButton() && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage = currentPage > 1 ? currentPage - 1 : totalPages;
            } else if (i.customId === 'next') {
                currentPage = currentPage < totalPages ? currentPage + 1 : 1;
            }

            row.components[1].setLabel(`${currentPage}/${totalPages}`);

            await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const timedEmbed = new Discord.EmbedBuilder()
                    .setTitle('⏰ Tempo Esgotado ⏰')
                    .setColor('#a600ff')
                    .setDescription('A navegação de changelogs expirou. Use `/changelogs` para visualizar novamente.')
                    .setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                await interaction.editReply({ embeds: [timedEmbed], components: [] }).then(() => {
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 30000);
                });
            }
        });
    }
};