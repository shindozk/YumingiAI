const Discord = require("discord.js");

module.exports = {
    async execute(client) {
        client.on(Discord.Events.InteractionCreate, async interaction => {
            if (!interaction.isStringSelectMenu()) return;
            const select = interaction.values[0];
            if(interaction.customId == 'playeroptions') {
                if (select === 'loop') {
                    const queue = client.distube.getQueue(interaction.guild.id);
                    if (!queue) {
                        await interaction.reply("There is no music playing in this server.");
                        return;
                    }

                    if (queue.repeatMode === 0) {
                        queue.setRepeatMode(1); // Set repeat mode to "repeat one"
                        await interaction.reply("The current song is now on loop.");
                    } else {
                        queue.setRepeatMode(0); // Disable repeat mode
                        await interaction.reply("The loop has been disabled.");
                    }
                }
            }
        })
    }
}