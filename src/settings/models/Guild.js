const mongoose = require("mongoose");

const CreateGuild = mongoose.Schema({
    GuildId: { type: String, required: true },
    GuildAvatar: { type: String, required: true },
    GuildBanner: { type: String, default: "https://cdn.discordapp.com/attachments/921914162475593809/1233414411545219163/fox-anime-girl-forest-animal-ear-hd-wallpaper-uhdpaper.com-8990i.jpg" },
    RankGuilds: { type: String, required: true },
    RankUsersLocal: { type: String, required: true },
    RankUsersGlobal: { type: String, required: true },
    PlayerControl: { type: String, default: "enable" },
    GuildListenCall: { type: String, required: true },
    GuildSongsListen: { type: Number, required: true },
    HistoricGuild: { type: String, default: null },
    is247: { type: Boolean, default: false },
    voiceChannelId: { type: String, default: null },
    //lofiEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model("Guild", CreateGuild);