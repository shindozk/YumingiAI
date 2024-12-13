const { Client, GatewayIntentBits, Partials } = require('discord.js');

client = new Client({
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
    },
	intents: Object.values(GatewayIntentBits),
	partials: Object.values(Partials),
	shards: 'auto',
});

client.config = require('./settings/config');
const { readdirSync } = require('node:fs');

readdirSync('./src/utils').map(async file => {
	const util = await require(`./utils/${file}`);
	util.execute(client);
});

client.login(client.config.token);