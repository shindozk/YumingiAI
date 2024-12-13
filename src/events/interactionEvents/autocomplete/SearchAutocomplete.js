const Discord = require("discord.js");

module.exports = {
    async execute(client) {
        client.on(Discord.Events.InteractionCreate, async interaction => {
            if (!interaction.isAutocomplete()) return;
                const command = client.slashCommands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                try {
                    await command.autocomplete(interaction);
                } catch (error) {
                    console.error(error);
                }
        })
    }
}