const {Collection} = require('discord.js');
const {readdirSync} = require('node:fs');

module.exports = {
	async execute(client) {
		client.slashCommands = new Collection();
		client.slashData = [];

		// - Handlers -
		const commandFolders = await readdirSync('./src/commands');

		await Promise.all(commandFolders.map(async category => {
			const commandFiles = await readdirSync(`./src/commands/${category}`);

			await Promise.all(commandFiles.map(async file => {
				const commands = await import(`../commands/${category}/${file}`);

				if (commands) {

					if (commands.command && commands.command.data) {
						// Slash Command
						const slashCommand = commands.command;
						client.slashData.push(slashCommand.data.toJSON());
						client.slashCommands.set(slashCommand.data.name, slashCommand);
					}
				}
			}));
		}));
	},
};