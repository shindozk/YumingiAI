const Discord = require("discord.js");

module.exports = {
    async execute(client) {
        client.on(Discord.Events.InteractionCreate, async interaction => {
            if (!interaction.isStringSelectMenu()) return;
            const select = interaction.values[0];
            if(interaction.customId == 'playeroptions') {
                if (select === 'selecthome') {
                    await interaction.reply({ content: "Sua interação foi resetada.", ephemeral: true }).then(() => {
                        setTimeout(async () => {
                            interaction.deleteReply().catch((e) => {});
                        }, 5000);
                    });
                }
            }
        })
    }
}