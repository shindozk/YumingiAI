const Discord = require("discord.js");

exports.command = {
    data: new Discord.SlashCommandBuilder()
    .setName('adminsetup')
    .setDescription('[Admin] - Configurações no sistema da Yoruka.'),
    cooldown: 5000,
    directory: 'Admin',
    ownerOnly: true,
    isCommandOffline: false,
    async execute(client, interaction) {
        interaction.reply('test')
    }
}