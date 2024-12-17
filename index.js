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
client.names = new Map()
client.timers = new Map()

client.once("ready", async (c) => {
    client.user.setStatus('invisible');
    logger.success(`Logged in as ${c.user.username}`);
    // doing this timeout thing to prevent older versions to break
    const timeout = client.config.farmSleepTime[0] || client.config.farmSleepTime

    farm(client)
    setInterval(() => farm(client), timeout)
});

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
        const edited = name.replace('.png.bin', '');

        const randomTimeout = Math.floor(Math.random() * (client.config.timeout[1] - client.config.timeout[0] + 1)) + client.config.timeout[0] || 10;

        setTimeout(async () => {
            try {
                const btn = await message.clickButton();
                client.timers.set(btn.id, time);
                client.names.set(btn.id, edited);    
            } catch {
                // pass
            }
        }, randomTimeout);
    }
});


client.on("messageUpdate", async (old, message) => {
    if (message.author.id !== "999736048596816014") return;
    if (message.content.includes(`<@${client.user.id}>`)) {
        const match = message.content.match(/\*\*(.+?)!\*\* `\((#[A-F0-9]+), ([^`]+)\)`/)
        const emoji = getTextBetweenColons(message.content)
        logger.success(`Caught ${match[1]} (${match[2]} . ${match[3]}) in: ${message.guild.name} ${message.channel.name} - ${message.guild.id} ${message.channel.id}`)
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


client.on('interactionModalCreate', async modal => {
    await waitForMap(modal.id)
    await modal.components[0].components[0].setValue(client.names.get(modal.id));
    await modal.reply();
    logger.success(`Caught ${client.names.get(modal.id)} in ${Math.round((Date.now() - client.timers.get(modal.id)) / 100) / 10} seconds`)
    await client.names.delete(modal.id)
    await client.timers.delete(modal.id)
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

function waitForMap(sex) {
    return new Promise((resolve) => {
        var num = 0
        const interval = setInterval(() => {
            if (client.names.get(sex)) {
                clearInterval(interval);
                resolve();
            } else if (num >= 1000) {
                clearInterval(interval);
                return;
            } else {
                num++
            }
        }, 60);
    });
}

function getTextBetweenColons(text) {
    const match = text.match(/:(.*?):/);
    return match ? match[1] : null;
}

process.on('unhandledRejection', (reason, promise) => {return logger.error(`${reason}: ${promise}`)});process.on('rejectionHandled', (promise) => {return logger.error(promise)});process.on("uncaughtException", (err, origin) => {return logger.error(`${err}: ${origin}`)});process.on('uncaughtExceptionMonitor', (err, origin) => {return logger.error(`${err}: ${origin}`)});
