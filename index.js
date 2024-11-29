try {
    require('./config.js');
} catch {
    console.log('No config file found.');
    process.exit();
}

const AutoGitUpdate = require('auto-git-update');
const updater = new AutoGitUpdate({
    repository: 'https://github.com/ballsdex-autocatcher/ballsdex-autocatcher',
    fromReleases: false,
    tempLocation: 'tmp',
    ignoreFiles: ['config.js'],
    executeOnComplete: 'npm install',
    exitOnComplete: true
});
updater.autoUpdate();

const { compareWithFolderImages } = require('./functions/compare.js');
const farm = require('./functions/farmServers.js');
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');

// Assuming the config.js exports tokens as an array
const tokens = require('./config.js').tokens || [];  // Fetch tokens from the config

// Loop through each token to create and login to a new client
tokens.forEach(token => {
    const clientInstance = new Client();  // Create a new Client instance for each token
    
    clientInstance.config = require('./config.js');  // Access config for each client instance
    clientInstance.names = new Map();
    clientInstance.timers = new Map();

    // Define events for each client instance
    clientInstance.once("ready", async (c) => {
        console.log(`${c.user.username} is ready`);
        const randomTimeout = Math.floor(Math.random() * (clientInstance.config.farmSleepTime[1] - clientInstance.config.farmSleepTime[0] + 1)) + clientInstance.config.farmSleepTime[0] || 300000;
        farm(clientInstance);
        setInterval(() => farm(clientInstance), randomTimeout);
        setInterval(() => updater.autoUpdate(), 600000);
    });

    clientInstance.on("messageCreate", async (message) => {
        if (
            message.author.id === "999736048596816014" && 
            (clientInstance.config.whitelistedServers.length === 0 || [message.guild.id, message.guild.name].some(id => clientInstance.config.whitelistedServers.includes(id))) &&
            [message.guild.id, message.guild.name].some(item => !clientInstance.config.blacklistedServers.includes(item)) &&
            message.content.includes("countryball appeared!")
        ) {
            const time = Date.now();
            const img = Array.from(message.attachments)[0][1].url;

            const name = await compareWithFolderImages(img);
            const edited = name.replace('.png.bin', '');

            const randomTimeout = Math.floor(Math.random() * (clientInstance.config.timeout[1] - clientInstance.config.timeout[0] + 1)) + clientInstance.config.timeout[0] || 10;

            setTimeout(async () => {
                const btn = await message.clickButton();
                clientInstance.timers.set(btn.id, time);
                clientInstance.names.set(btn.id, edited);
            }, randomTimeout);
        }
    });

    clientInstance.on("messageUpdate", async (old, message) => {
        if (message.author.id !== "999736048596816014") return;
        if (message.content.includes(`<@${clientInstance.user.id}>`)) {
            const match = message.content.match(/\*\*(.+?)!\*\* `\((#[A-F0-9]+), ([^`]+)\)`/);
            const emoji = getTextBetweenColons(message.content);
            console.log(`Caught ${match[1]} (${match[2]} . ${match[3]}) in:\n${message.guild.name} - ${message.channel.name}\nhttps://discord.com/channels/${message.guild.id}/${message.channel.id}`);
            try {
                if (clientInstance.config.dashboardToken) {
                    await axios.post('https://autocatcher.xyz/api/v1/submit', {
                        name: match[1],
                        stats: match[3],
                        id: match[2],
                        guild: message.guild.name,
                        guildid: message.guild.id,
                        channel: message.channel.name,
                        channelid: message.channel.id,
                        userid: clientInstance.user.id,
                        messageid: message.id,
                        emoji: emoji
                    }, {
                        headers: {
                            'authorization': clientInstance.config.dashboardToken
                        }
                    });
                } else {
                    await axios.post('https://autocatcher.xyz/api/v1/submit', {
                        name: match[1],
                        messageid: message.id // not stored
                    });
                }    
            } catch (err) {
                // Handle error
                console.log(err);
            }
        }
    });

    clientInstance.on('interactionModalCreate', async modal => {
        await waitForMap(modal.id);
        await modal.components[0].components[0].setValue(clientInstance.names.get(modal.id));
        await modal.reply();
        console.log(`Caught ${clientInstance.names.get(modal.id)} in ${Math.round((Date.now() - clientInstance.timers.get(modal.id)) / 100) / 10} seconds`);
        await clientInstance.names.delete(modal.id);
        await clientInstance.timers.delete(modal.id);
    });

    // Log in with the current token
    clientInstance.login(token);
});

// Helper function to wait for map data
function waitForMap(sex) {
    return new Promise((resolve) => {
        var num = 0;
        const interval = setInterval(() => {
            if (clientInstance.names.get(sex)) {
                clearInterval(interval);
                resolve();
            } else if (num >= 1000) {
                clearInterval(interval);
                return;
            } else {
                num++;
            }
        }, 60);
    });
}

function getTextBetweenColons(text) {
    const match = text.match(/:(.*?):/);
    return match ? match[1] : null;
}

process.on('unhandledRejection', (reason, promise) => { return console.log(reason) });
process.on('rejectionHandled', (promise) => { return console.log(promise) });
process.on("uncaughtException", (err, origin) => { return console.log(err) });
process.on('uncaughtExceptionMonitor', (err, origin) => { return console.log(err) });
