const logger = require('./functions/logger.js')
try {
    require('./config.js')
} catch {
    logger.error('No config file found.')
    process.exit()
}

const { compareWithFolderImages } = require('./functions/compare.js');
const farm = require('./functions/farmServers.js')
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios')
const fs = require('node:fs')
const path = require('node:path')

const client = new Client();

client.config = require('./config.js')

let balls = 0;

client.once("ready", async (c) => {
    client.user.setStatus('invisible');
    logger.success(`Logged in as ${c.user.username}`);
    // doing this timeout thing to prevent older versions to break
    const timeout = client.config.farmSleepTime[0] || client.config.farmSleepTime

    farm(client)
    setInterval(() => farm(client), timeout)
});


setInterval(async () => {
    const uptime = process.uptime()
    const ballsPerHour = Math.floor(balls / (uptime / 60 / 60))
    logger.info(`Balls per hour: ${ballsPerHour}`)
}, 30 * 60 * 1000);

client.on("messageCreate", async (message) => {
    if (
        message.author.id === "999736048596816014" && 
        (client.config.whitelistedServers.length === 0 || [message.guild.id, message.guild.name].some(id => client.config.whitelistedServers.includes(id))) &&
        [message.guild.id, message.guild.name].some(item => !client.config.blacklistedServers.includes(item)) &&
        message.attachments &&
        message.attachments.size === 1 &&
        message.components &&
        message.components[0].components.length === 1
    ) {
        const time = Date.now()
        const img = Array.from(message.attachments)[0][1].url;
        const name = await compareWithFolderImages(img);
        if (!name) return logger.info('Ignored a ball');
        const edited = name.replace('.png.bin', '');

        if (
            (client.config.whitelistedBalls.length === 0 || client.config.whitelistedBalls.includes(edited)) &&
            !client.config.blacklistedBalls.includes(edited)
        ) {

        const randomTimeout = Math.floor(Math.random() * (client.config.timeout[1] - client.config.timeout[0] + 1)) + client.config.timeout[0];

setTimeout(async () => {
    try {
        const btn = await message.clickButton();
        await btn.components[0].components[0].setValue(edited);
        await btn.reply();
        logger.success(`Caught ${edited} in ${Math.round((Date.now() - time) / 100) / 10} seconds`);
    } catch {
        logger.error(`Failed to catch ${edited}`);
        setTimeout(async () => {
            logger.info(`Retrying to catch ${edited}`);
            try {
                const btn = await message.clickButton();
                await btn.components[0].components[0].setValue(edited);
                await btn.reply();
                logger.success(`Caught ${edited} on retry`);
                logger.success(`Caught ${edited} in ${Math.round((Date.now() - time) / 100) / 10} seconds`);
            } catch (error) {
                if (error.message === 'BUTTON_NOT_FOUND') {
                logger.success(`Caught ${edited} on retry`);
                logger.success(`Caught ${edited} in ${Math.round((Date.now() - time) / 100) / 10} seconds`);
                } else {
                    logger.error(`Retry also failed for ${edited}: ${error.message}`);
                }
            }
        }, 3000);
    }
}, randomTimeout);
    }
}
});


client.on("messageUpdate", async (old, message) => {
    if (message.author.id !== "999736048596816014") return;
    if (message.content.includes(`<@${client.user.id}>`)) {
        const match = message.content.match(/\*\*(.+?)!\*\* `\((#[A-F0-9]+), ([^`]+)\)`/)
        const emoji = getTextBetweenColons(message.content)
        logger.success(`Caught ${match[1]} (${match[2]} . ${match[3]}) in: ${message.guild.name} ${message.channel.name} - ${message.guild.id} ${message.channel.id}`)
        balls += 1;

        if (client.config.messageCooldown && client.config.messageCooldown.length && client.config.messages && ![message.guild.id, message.guild.name].some(id => client.config.farmServers.includes(id))){
        const randomMessage = client.config.messages[Math.floor(Math.random() * client.config.messages.length)];
        const messageCooldown = Math.floor(Math.random() * (client.config.messageCooldown[1] - client.config.messageCooldown[0] + 1)) + client.config.messageCooldown[0];

        setTimeout(async () => {
            await message.channel.sendTyping();
            setTimeout(async () => {
                await message.channel.send(randomMessage);
                logger.success(`Sent "${randomMessage}" in: ${message.guild.name}`);
            }, messageCooldown);
        }, (10 / 100) * messageCooldown);
    }
        
        try {
            if (client.config.dashboardToken) {
                await axios.post('https://autocatcher.xyz/api/v1/submit', {
                    name: match[1],
                    stats: match[3],
                    id: match[2],
                    guild: message.guild.name,
                    guildid: message.guild.id,
                    channel: message.channel.name,
                    channelid: message.channel.id,
                    userid: client.user.id,
                    messageid: message.id,
                    emoji: emoji
                }, {
                    headers: {
                        'authorization': client.config.dashboardToken
                    }
                })
            } else {
                await axios.post('https://autocatcher.xyz/api/v1/submit', {
                    name: match[1],
                    messageid: message.id // not stored
                })
            }    
        } catch {'pass'}

    }
})

const extensionsDir = path.join(__dirname, 'extensions')
const extensionFiles = fs.readdirSync(extensionsDir)
const extensions = extensionFiles.filter(file => file.endsWith('.js'))
for (const extension of extensions) {
    const extensionPath = path.join(extensionsDir, extension)
    const ext = require(extensionPath)

    if ('func' in ext && 'name' in ext && 'description' in ext) {
        ext.func(client)
        logger.info(`Loaded ${ext.name} from extensions`)
    }
}

client.login(client.config.token)

function getTextBetweenColons(text) {
    const match = text.match(/:(.*?):/);
    return match ? match[1] : null;
}

process.on('unhandledRejection', (reason, promise) => {return logger.error(`${reason}: ${promise}`)});process.on('rejectionHandled', (promise) => {return logger.error(promise)});process.on("uncaughtException", (err, origin) => {return logger.error(`${err}: ${origin}`)});process.on('uncaughtExceptionMonitor', (err, origin) => {return logger.error(`${err}: ${origin}`)});
