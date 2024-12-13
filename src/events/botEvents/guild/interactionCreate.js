const { Collection, Events, InteractionType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Discord = require('discord.js');
const User = require("./../../../settings/models/User");
const Guild = require("./../../../settings/models/Guild");
const cooldown = new Collection();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		try {
			const {client} = interaction;
			if (!interaction || !interaction.type) return;

			if (interaction.type !== InteractionType.ApplicationCommand) return;
			if (!interaction.isChatInputCommand()) return;

			/*let findGuild = await Guild.findOne({ GuildId: interaction.guild.id });

            const guildLanguage = interaction.guild.preferredLocale;

			if (!findGuild) {
				const newGuild = new Guild({
					GuildId: interaction.guild.id,
					GuildAvatar: interaction.guild.iconURL() || '',  // Certifique-se de que guild.iconURL() retorna um URL válido
					GuildBanner: 'https://cdn.discordapp.com/attachments/921914162475593809/1233414411545219163/fox-anime-girl-forest-animal-ear-hd-wallpaper-uhdpaper.com-8990i.jpg',
					RankGuilds: 'N/A',  // Defina o valor padrão ou ajuste conforme necessário
					RankUsersLocal: 'N/A',  // Defina o valor padrão ou ajuste conforme necessário
					RankUsersGlobal: 'N/A',  // Defina o valor padrão ou ajuste conforme necessário
					GuildListenCall: 0,
					GuildSongsListen: 0,
				});

				await newGuild.save();
			}*/

			/*const findUser = await User.findOne({ MemberId: interaction.user.id });

			if (!findUser) {
				const currentDate = new Date();
				const currentDateFormatted = currentDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
				const newUser = new User({
					MemberId: interaction.user.id,
					MemberAvatar: interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }),
					MemberUsername: interaction.user.username,
					MemberEnterDate: currentDateFormatted,
				});
				await newUser.save();
			}*/

			/*const userBan = await User.findOne({ UserId: interaction.user.id });
			const statusBan = userBan.status;

			if (userBan && statusBan.isBanned === true && interaction.user.id !== client.config.owner_id) {
				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder().setLabel("Suporte").setURL(client.config.supportURL).setStyle(Discord.ButtonStyle.Link),
				);
				return interaction.reply({
					content: `\`❌\` | You are banned from using ${client.user}, click the button support to appeal.`,
					components: [row],
					ephemeral: true,
				});
			};*/

			const command = client.slashCommands.get(interaction.commandName);
			if (!command) return;

			if (command.ownerOnly && interaction.user.id !== client.config.owner_id) {
				return interaction.reply({content: `${client.config.emojiapp.yoruka_error} | ${interaction.user.username}, vixi, saiba que esse comando só pode ser executado pelo meu criador? Mais fique tranquilo, você pode usar outros comandos que estão liberados...`, ephemeral: true});
			}

			if (command.isCommandOffline === true && interaction.user.id !== client.config.owner_id) {
				return interaction.reply({
					content: `${client.config.emojiapp.yoruka_mini} | ${interaction.user.username}, Desculpinha, acabei de ver que este comando está temporariamente desativado para manutenção. Por favor, tente novamente mais tarde ou fale com o suporte, blz?`,
					ephemeral: true,
				});
			}

			if (command.cooldown) {
				if (cooldown.has(`${command.name}-${interaction.user.id}`)) {
					const nowDate = interaction.createdTimestamp;
					const waitedDate = cooldown.get(`${command.name}-${interaction.user.id}`) - nowDate;
					return interaction.reply({
						content: `${client.config.emojiapp.yoruka_mini} | ${interaction.user.username}, Humm, espere um tempinho meu parça, pareçe que o Cooldown está ativo agora mesmo, tente usar o comando de novo em <t:${Math.floor(new Date(nowDate + waitedDate).getTime() / 1000)}:R>`,
						ephemeral: true,
					}).then(() => setTimeout(() => interaction.deleteReply(), cooldown.get(`${command.name}-${interaction.user.id}`) - Date.now() + 2000));
				}

				await command.execute(client, interaction);

				cooldown.set(`${command.name}-${interaction.user.id}`, Date.now() + command.cooldown);

				setTimeout(() => {
					cooldown.delete(`${command.name}-${interaction.user.id}`);
				}, command.cooldown + 2000);
			} else {
				await command.execute(client, interaction);
			}
		} catch (e) {
			console.error(e);
			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setLabel("Suporte").setURL(client.config.supportURL).setStyle(Discord.ButtonStyle.Link),
			);
			interaction.reply({content: `${client.config.emojiapp.yoruka_error} | ${interaction.user.username}, Eita!! Houve algum problema pra executar o comando! Por favor, tente novamente mais tarde, caso não funcionar, você pode mandar uma mensagem pra o meu criador e pode deixar que já estou reportando o problema.`, components: [row], ephemeral: true});
		}
	},
};