const Discord = require('discord.js');

const fetch = require('node-fetch');

const moment = require('moment');

const paginationEmbed = require("discordjs-button-pagination");

const config = require('./config.json');
let friendsArray = [];

const client = new Discord.Client({
    intents: [
        'GUILDS',
        'DIRECT_MESSAGES',
        'GUILD_MESSAGES'
    ],
    partials: ['MESSAGE', 'CHANNEL']
});

let testEmbed = new Discord.MessageEmbed();

client.on('ready', () => {

    console.log(`\n------ [ BOT IS ONLINE ] ------\nLogged in as: ${client.user.tag}\nMade by: Amino#4229\nSupport Discord: discord.gg/RVePam7pd7\n-------------------------------`);

});

client.on('messageCreate', message => {

    const args = message.content.slice(config.BOT_PREFIX.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (config.SPECIFIED_EAC_CHECK_CHANNEL.USE_EAC_CHECK_CHANNEL) {

        if (message.channel.id === config.SPECIFIED_EAC_CHECK_CHANNEL.EAC_CHECK_CHANNEL_ID) {

            if (client.user.id === message.author.id) {
                return;
            }

            const channelArgs = message.content.split(" ");

            if (!channelArgs[0].includes("765611")) {

                return message.reply("Please only post a steam64ID in this channel!");

            }

            let embed = new Discord.MessageEmbed()
                .setDescription("Loading...")

            message.reply({ embeds: [embed] }).then(async m => {

                fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${channelArgs[0]}`).then(res => res.json()).then(steam => {

                    if (!steam.response.players[0]) {

                        let embed = new Discord.MessageEmbed()
                            .setDescription(`${channelArgs[0]} profile does not exist...`)

                        return m.edit({ embeds: [embed] });

                    }

                    const { personaname, avatarfull, profileurl, steamid } = steam.response.players[0];

                    fetch(`https://rustbanned.com/api/eac_ban_check_v2.php?apikey=${config.RUST_BANNED_API_KEY}&steamid64=${steamid}`).then(res => res.json()).then(check => {

                        if (!check.auth) {

                        } else {
                            client.user.setPresence({ activities: [{ type: `WATCHING`, name: `${check.auth.daily_count} checks done today! ${check.auth.daily_limit - check.auth.daily_count} left today!` }], status: `online` })
                            console.log(`${check.auth.daily_count} checks done today! ${check.auth.daily_limit - check.auth.daily_count} left today!`)
                        }

                        if(check.response[0].eac_ban_count === "0") {

                            embed = new Discord.MessageEmbed()
                            .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                            .setThumbnail(avatarfull)
                            .setDescription(`**SteamID:** ${steamid}\n**Profile:** [here](${profileurl})\n**BattleMetrics:** [here](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false)\n\n**Rust EAC Banned:** false`)
                            .setImage(`https://cdn.discordapp.com/attachments/731315330831351835/843601761671053313/NOTBanned.png`)
                            .setColor('#33ff3d')

                        return m.edit({ embeds: [embed] });

                        } else {

                            const { url, days_ago, date, vac_ban, eac_ban_count } = check.response[0];

                            const row = new Discord.MessageActionRow().addComponents(
                                new Discord.MessageButton()
                                    .setLabel("Steam")
                                    .setURL(`${profileurl}`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Battlemetrics")
                                    .setURL(`https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Tweet")
                                    .setURL(`${url}`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Rustban")
                                    .setURL(`https://rustbanned.com/profile/${steamid}`)
                                    .setStyle("LINK")
                            )


                            const checktime = moment(`${date}`, "YYYY-MM-DD").format("MMM DD, YYYY");

                            embed = new Discord.MessageEmbed()
                                .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                                .setThumbnail(avatarfull)
                                .setDescription(`**SteamID:** ${steamid}\n**Profile URL:** [here](${profileurl})\n**BattleMetrics:** [here](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false)\n\n**USER IS EAC BANNED!**\n> **Twitter post:** [here](${url})\n> **Banned on:** ${checktime} - ${days_ago} day(s) ago\n\n**VAC bans:** ${vac_ban}\n**Game bans:** ${eac_ban_count}`)
                                .setColor('#ff3838')
                                .setImage(`https://cdn.discordapp.com/attachments/731315330831351835/843601030763249704/EACBanned.png`)


                            m.edit({ embeds: [embed], components: [row] });

                        }


                        if (!check.error) {

                        } else if (check.error) {
                            console.log("AN ERROR HAS OCCURED... ERROR ID: " + check.error.errorid)
                            console.log("ERROR RESPONSE: " + check.error.errormsg)

                            if (check.error.errorid === '0') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``**TLDR:** ``Database error``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '3' || check.error.errorid === '6') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``API Key ERROR``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '4') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Over 50K request limit per day.``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '9') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Your API key has been disabled.``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            }

                        }

                    });

                });
            });

        }

    }

    if (command === "eac" || command === "check") {

        if (config.ROLE_REQUIRED && !message.member.roles.cache.has(config.ROLE_ID_REQUIRED_TO_USE_COMMAND)) {

            return message.reply("You do not have the required role to use this command.");

        }

        if (!args[0]) {

            return message.reply("Please post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }

        if (!args[0].includes("765611")) {

            return message.reply("Please only post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }

        let embed = new Discord.MessageEmbed()
            .setDescription("Loading...")

        message.reply({ embeds: [embed] }).then(async m => {

            fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${args[0]}`).then(res => res.json()).then(steam => {

                    if (!steam.response.players[0]) {

                        let embed = new Discord.MessageEmbed()
                            .setDescription("This profile does not exist...")

                        return m.edit({ embeds: [embed] });

                    }

                    const { personaname, avatarfull, profileurl, steamid } = steam.response.players[0];

                    fetch(`https://rustbanned.com/api/eac_ban_check_v2.php?apikey=${config.RUST_BANNED_API_KEY}&steamid64=${steamid}`).then(res => res.json()).then(check => {

                        if (!check.auth) {

                        } else {
                            client.user.setPresence({ activities: [{ type: `WATCHING`, name: `${check.auth.daily_count} checks done today! ${check.auth.daily_limit - check.auth.daily_count} left today!` }], status: `online` })
                            console.log(`${check.auth.daily_count} checks done today! ${check.auth.daily_limit - check.auth.daily_count} left today!`)
                        }

                        if(check.response[0].eac_ban_count === "0") {

                            embed = new Discord.MessageEmbed()
                            .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                            .setThumbnail(avatarfull)
                            .setDescription(`**SteamID:** ${steamid}\n**Profile:** [here](${profileurl})\n**BattleMetrics:** [here](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false)\n\n**Rust EAC Banned:** false`)
                            .setImage(`https://cdn.discordapp.com/attachments/731315330831351835/843601761671053313/NOTBanned.png`)
                            .setColor('#33ff3d')

                        return m.edit({ embeds: [embed] });

                        } else {

                            const { url, days_ago, date, vac_ban, eac_ban_count } = check.response[0];

                            const row = new Discord.MessageActionRow().addComponents(
                                new Discord.MessageButton()
                                    .setLabel("Steam")
                                    .setURL(`${profileurl}`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Battlemetrics")
                                    .setURL(`https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Tweet")
                                    .setURL(`${url}`)
                                    .setStyle("LINK"),
                                new Discord.MessageButton()
                                    .setLabel("Rustban")
                                    .setURL(`https://rustbanned.com/profile/${steamid}`)
                                    .setStyle("LINK")
                            )

                            const checktime = moment(`${date}`, "YYYY-MM-DD").format("MMM DD, YYYY");

                            embed = new Discord.MessageEmbed()
                                .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                                .setThumbnail(avatarfull)
                                .setDescription(`**SteamID:** ${steamid}\n**Profile URL:** [here](${profileurl})\n**BattleMetrics:** [here](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false)\n\n**USER IS EAC BANNED!**\n> **Twitter post:** [here](${url})\n> **Banned on:** ${checktime} - ${days_ago} day(s) ago\n\n**VAC bans:** ${vac_ban}\n**Game bans:** ${eac_ban_count}`)
                                .setColor('#ff3838')
                                .setImage(`https://cdn.discordapp.com/attachments/731315330831351835/843601030763249704/EACBanned.png`)


                            m.edit({ embeds: [embed], components: [row] });

                        }


                        if (!check.error) {

                        } else if (check.error) {
                            console.log("AN ERROR HAS OCCURED... ERROR ID: " + check.error.errorid)
                            console.log("ERROR RESPONSE: " + check.error.errormsg)

                            if (check.error.errorid === '0') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``**TLDR:** ``Database error``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '3' || check.error.errorid === '6') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``API Key ERROR``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '4') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Over 50K request limit per day.``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            } else if (check.error.errorid === '9') {

                                embed = new Discord.MessageEmbed()
                                    .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Your API key has been disabled.``")
                                    .setColor('#ff3838')

                                return m.edit({ embeds: [embed] });

                            }

                        }

                });
            });
        });

    } else if (command === "friends" || command === "friend") {

        if (config.ROLE_REQUIRED && !message.member.roles.cache.has(config.ROLE_ID_REQUIRED_TO_USE_COMMAND)) {

            return message.reply("You do not have the required role to use this command.");

        }

        if (!args[0]) {

            return message.reply("Please post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }

        if (!args[0].includes("765611")) {

            return message.reply("Please only post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }


        let embed = new Discord.MessageEmbed()
            .setDescription("Loading...")

        message.reply({ embeds: [embed] }).then(async m => {

            fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${args[0]}`).then(res => res.json()).then(steam => {

                if (!steam.response.players[0]) {

                    let embed = new Discord.MessageEmbed()
                        .setDescription("This profile does not exist...")

                    return m.edit({ embeds: [embed] });
                }

                const { personaname, avatarfull, profileurl, steamid } = steam.response.players[0];

                testEmbed = new Discord.MessageEmbed()
                    .setDescription(personaname)

                fetch(`https://rustbanned.com/api/eac_friend_ban_check.php?apikey=${config.RUST_BANNED_API_KEY}&steamid64=${steamid}`).then(res => res.json()).then(check => {

                    if (!check.status.checked_friends_success) {
                    } else if (check.status.checked_friends_success === '1' && check.status.eac_banned_friend_count > 0) {

                        let friends = "";
                        fetch(`https://rustbanned.com/api/eac_ban_check_v2.php?apikey=${config.RUST_BANNED_API_KEY}&steamid64=${check.current_friends_banned.steamid64}`).then(res => res.json()).then(body => {

                            body.response.forEach(friend => {
                                friendsArray.push(`[${friend.steamid64}](https://steamcommunity.com/profiles/${friend.steamid64}) -> [${friend.days_ago} Day(s) ago](${friend.url})`)
                            });

                            friends = friendsArray.join("\n");

                            embed = new Discord.MessageEmbed()
                                .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                                .setThumbnail(avatarfull)
                                .setDescription(`**SteamID:** ${steamid}\n**Profile URL:** [here](${profileurl})\n**BattleMetrics:** [here](https://www.battlemetrics.com/rcon/players?filter%5Bsearch%5D=${steamid}&filter%5Bservers%5D=false&filter%5BplayerFlags%5D=&sort=score&showServers=false)\n\n**Total Friends:** ${check.status.friend_count}\n**Total EAC banned friends:** ${check.status.eac_banned_friend_count}\n\n**Banned friends:** \n${friends}`)
                                .setColor('#ff3838')

                            return m.edit({ embeds: [embed] });
                        });

                    } else if (check.status.checked_friends_success === '1' & check.status.eac_banned_friend_count === '0') {

                        embed = new Discord.MessageEmbed()
                            .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                            .setThumbnail(avatarfull)
                            .setDescription(`User has no EAC banned friends!`)
                            .setColor('#33ff3d')

                        return m.edit({ embeds: [embed] });

                    } else if (check.status.checked_friends_success === '0') {

                        embed = new Discord.MessageEmbed()
                            .setAuthor({ name: `Account check for ${personaname}`, iconURL: avatarfull, url: profileurl })
                            .setThumbnail(avatarfull)
                            .setDescription(`Private account... Cannot check for EAC banned friends...`)
                            .setColor('#33ff3d')

                        return m.edit({ embeds: [embed] });

                    }

                    if (!check.error) {

                    } else if (check.error) {
                        console.log("AN ERROR HAS OCCURED... ERROR ID: " + check.error.errorid)
                        console.log("ERROR RESPONSE: " + check.error.errormsg)

                        if (check.error.errorid === '0') {

                            embed = new Discord.MessageEmbed()
                                .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``**TLDR:** ``Database error``")
                                .setColor('#ff3838')

                            return m.edit({ embeds: [embed] });

                        } else if (check.error.errorid === '3' || check.error.errorid === '6') {

                            embed = new Discord.MessageEmbed()
                                .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``API Key ERROR``")
                                .setColor('#ff3838')

                            return m.edit({ embeds: [embed] });

                        } else if (check.error.errorid === '4') {

                            embed = new Discord.MessageEmbed()
                                .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Over 50K request limit per day.``")
                                .setColor('#ff3838')

                            return m.edit({ embeds: [embed] });

                        } else if (check.error.errorid === '9') {

                            embed = new Discord.MessageEmbed()
                                .setDescription("**ERROR:** ``" + check.error.errormsg + "``\n**ERROR ID:** ``" + check.error.errorid + "``\n**TLDR:** ``Your API key has been disabled.``")
                                .setColor('#ff3838')

                            return m.edit({ embeds: [embed] });

                        }

                    }

                });
            });
        });
    } else if (command === "bans") {

        if(!config.BATTLEMETRICS.USE_BATTLEMETRICS_BAN_CHECK) {

            return message.reply("This command is not enabled in the config.");

        }

        if (config.BATTLEMETRICS.USE_BATTLEMETRICS_BAN_CHECK && !config.BATTLEMETRICS.ROLE_ID_REQUIRED_TO_USE_BANS_COMMAND) {

            return message.reply("This command requies a role to use but no role has been provided.");

        }
        
        if (config.BATTLEMETRICS.USE_BATTLEMETRICS_BAN_CHECK && !message.member.roles.cache.has(config.BATTLEMETRICS.ROLE_ID_REQUIRED_TO_USE_BANS_COMMAND)) {

            return message.reply("You do not have the required role to use this command.");

        }

        if (!args[0]) {

            return message.reply("Please post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }

        if (!args[0].includes("765611")) {

            return message.reply("Please only post a steam64ID! The command should be " + config.BOT_PREFIX + `${command} steam64ID`);

        }

        let embed = new Discord.MessageEmbed()
        .setDescription("Loading...")

    message.reply({ embeds: [embed] }).then(async m => {

        fetchHeaders = { 'Authorization': `Bearer ${config.BATTLEMETRICS.BATTLEMETRICS_API_KEY}` }

        fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.STEAM_API_KEY}&steamids=${args[0]}`).then(res => res.json()).then(steam => {

            if (!steam.response.players[0]) {
                const embed = new Discord.MessageEmbed()
                    .setDescription("Please make sure you are entering a valid **Steam 64ID**")

                message.reply({ embeds: [embed] });
            } else {
                const { personaname, avatarfull, profileurl, steamid } = steam.response.players[0];

                fetch(`https://api.battlemetrics.com/bans?filter[search]=${args[0]}&include=organization,user`, { method: "GET", headers: fetchHeaders }).then(res => res.json()).then(body => {
                    
                if(!body.errors) {

                } else {

                    body.errors.forEach(logErr => {

                        if(logErr.status === 401) {
            
                            let embed = new Discord.MessageEmbed()
                            .setDescription("**Your BattleMetrics API key is not allowing me to search bans... Or you have not provided a battlemetrics API key.**\n\n**Provided error from BM:**\n" + logErr.title + "\n\n" + logErr.detail)
                            .setColor('#33ff3d')

                            return m.edit({ embeds: [embed] });
            
                        } else {

                            console.log("ERROR: " + logErr)

                        }

                    });

                    return;

                }

                    const totalBans = body.meta.total;

                    if(totalBans === 0) {

                        const embed = new Discord.MessageEmbed()
                            .setAuthor({ name: `Bans for ${personaname}`, iconURL: avatarfull, url: profileurl })
                            .setThumbnail(avatarfull)
                            .setDescription("This user has no logged bans...")
                            .setColor('#33ff3d')

                        return m.edit({ embeds: [embed] });

                    } else {

                        let fetchArray = [];
                        body.data.forEach(ban => {
    
                            const banTime = moment(ban.attributes.timestamp).format("MMM DD, YYYY, h:mm a");
                            const banNote = ban.attributes.note;
                            const banReason = ban.attributes.reason;
                            const banId = ban.attributes.id;
                            const banExpiration = ban.attributes.expires;
    
                            if (banExpiration === null) {
    
                                banLife = "Perm";
    
                            } else {
    
                                banLife = moment(banExpiration).format("MMM DD, YYYY, h:mm a");
    
                            }

                            fetchArray.push(
                                new Discord.MessageEmbed()
                                .setAuthor({ name: `Bans for ${personaname}`, iconURL: avatarfull, url: profileurl })
                                .setThumbnail(avatarfull)
                                .setDescription(`**TOTAL BANS: ${totalBans}**\n\n` + `**Reason:** [${banReason}](https://www.battlemetrics.com/rcon/bans/edit/${banId})\n` + "**Ban date:** ``" + banTime + "\n``" + "**Ban expiration:** ``" + banLife + "`` ```NOTES: " + banNote + "```")
                                .setColor('#ff3838')
                            )
    
                        });

                        const button1 = new Discord.MessageButton()
                        .setCustomId("previousbtn")
                        .setLabel("Previous")
                        .setStyle("DANGER");
              
                      const button2 = new Discord.MessageButton()
                        .setCustomId("nextbtn")
                        .setLabel("Next")
                        .setStyle("SUCCESS");

                        let buttonList = [ button1, button2 ];
    
                           paginationEmbed(message, fetchArray, buttonList, 300000);

                    }

                });
            
            }
        });

    });
    }
});

client.login(config.DISCORD_BOT_TOKEN);