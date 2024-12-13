const Discord = require('discord.js');

exports.command = {
	data: new Discord.SlashCommandBuilder()
	.setName('ping')
	.setDescription('[Information] - Exibe informações de ping da aplicação.'),
    cooldown: 5000,
	directory: 'Information',
    ownerOnly: false,
	isCommandOffline: false,
    async execute(client, interaction) {
        // Calcular o tempo de resposta do bot
        const botPingStart = Date.now();
        await interaction.reply({ content: 'Carregando...', ephemeral: true });
        const botPingEnd = Date.now();
        const botPing = botPingEnd - botPingStart;

        // Obter o ping da API do Discord
        const apiPing = client.ws.ping;

        // Obter o tempo do servidor
        const serverTime = new Date().toLocaleString();

        // Montar a mensagem de resposta
		const embed = new Discord.EmbedBuilder()
		.setDescription(`${client.config.emojiapp.yoruka_mini} | Informações de ping`)
		.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, format: 'png' }) })
		.addFields(
			{
				name: '**App Ping**:', value: `${botPing}**ms**`, inline: false,
			},
			{
				name: '**API Ping**:', value: `${apiPing}**ms**`, inline: false,
			},
			{
				name: '**Server Time**:', value: `${serverTime}`, inline: false,
			}
		)
		.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
		.setColor("#a600ff")
		.setFooter({ text: `© ${client.user.username} ${new Date().getFullYear()} | Kandaraku Studios`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
		.setTimestamp();

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder().setCustomId('updateping').setLabel("Atualizar").setStyle(Discord.ButtonStyle.Primary),
        );

        // Enviar a mensagem de resposta e adicionar o botão de atualização
        await interaction.editReply({ embeds: [embed], content: `Ping carregado.`, components: [row], ephemeral: true });
    },
};