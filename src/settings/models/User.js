const mongoose = require("mongoose");

const CreateUser = mongoose.Schema({
    MemberId: { type: String, required: true },
    MemberAvatar: { type: String, required: true },
    MemberUsername: { type: String, required: true },
    MemberBanner: { type: String, default: "https://cdn.discordapp.com/attachments/921914162475593809/1233410743315992700/anime-girl-morning-breakfast-hd-wallpaper-uhdpaper.com-850i.jpg" },
    MemberAboutMe: { type: String, default: "Sou um membro da Yoruka, adoro escutar músicas e ouvir um lofi ;)" },
    YkCoins: { type: Number, default: 0 },
    MemberXp: { type: Number, default: 0 },
    MemberLevel: { type: Number, default: 1 },
    MemberEnterDate: { type: String, required: true },
    MemberListenCall: { type: String, required: true },
    MemberSongsListen: { type: Number, required: true },
    MemberHistoric: { type: String, default: null },
    configs: {
        FavoriteSongs: { type: String, default: null },
        PlaylistCreate: { type: String, default: null },
    },
    status: {
        isBanned: { type: Boolean, default: false },
        bannedBy: { type: String, default: null },
        bannedAt: { type: Date, default: null },
    },
});

module.exports = mongoose.model("User", CreateUser);