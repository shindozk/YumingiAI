const Discord = require("discord.js");

module.exports = {
    async execute(client) {
        client.on(Discord.Events.InteractionCreate, async interaction => {
            if (interaction.isButton()) {
                if (interaction.customId === 'updateping') {
                    const botPingStart = Date.now();
                    const botPingEnd = Date.now();
                    const botPing = botPingEnd - botPingStart;
                    const apiPing = client.ws.ping;
                    const serverTime = new Date().toLocaleString();

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

                    interaction.update({ embeds: [embed], content: `Ping atualizado.`, ephemeral: true })
                }
            }
        })
    }
}