const {ActivityType, Events} = require('discord.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v10');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const rest = new REST({version: '10'}).setToken(client.config.token);

		const status = [
            `Sabia que minha nova versão está sendo desenvolvida? Use /play para começar a testar | ${client.config.YorukaVersion}`,
            //`Assista seus animes favoritos gratuitamente no site: Em breve... | ${client.config.YorukaVersion}`,
            `Entre no servidor Kandaraku: https://dsc.gg/kandaraku | ${client.config.YorukaVersion}`,
            `Humm, não sabe como usar a Yoruka? Use /help para ver todos os meus comandos | ${client.config.YorukaVersion}`,
            `Me compartilhe com os seus amigos no Discord para me ajudar a crescer na plataforma! | ${client.config.YorukaVersion}`,
            //`Entre no meu servidor de suporte oficial [Taberna da Yoruka]: Em breve... | ${client.config.YorukaVersion}`,
            `${client.guilds.cache.size} servidores atualmente | ${client.config.YorukaVersion}`,
            `${client.users.cache.size} membros atualmente | ${client.config.YorukaVersion}`
        ];
            
            let i = 0;
            setInterval(() => {
                client.user.setPresence({ activities: [{ name: `${status[i++ % status.length]}`, type: 2 }], status: 'dnd' })
            }, 1000 * 30);

            console.log(`[INFO] ${client.user.username} atualmente em ${client.guilds.cache.size} servidores com ${client.users.cache.size} membros.`)
            client.log(`${client.user.username} Official Music > Bot iniciado com sucesso!`);

		try {
			await rest.put(Routes.applicationCommands(client.user.id), {
				body: client.slashData,
			});
		} catch (error) {
			console.error(error);
		}
	},
};