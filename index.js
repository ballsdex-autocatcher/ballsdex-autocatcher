try {
    require('./config.js')
} catch {
    console.log('No config file found.')
    process.exit()
}


const { compareWithFolderImages } = require('./functions/compare.js');
const farm = require('./functions/farmServers.js')
const { Client } = require('discord.js-selfbot-v13');


const client = new Client();

client.config = require('./config.js')
client.names = new Map()
client.timers = new Map()

client.once("ready", async (c) => {
    console.log(`${c.user.username} is ready`);
    farm(client)
    setInterval(() => farm(client), client.config.farmSleepTime)
});

client.on("messageCreate", async (message) => {
    if (
        message.author.id === "999736048596816014" && 
        !(client.config.whitelistedServers.lenght > 0 && [message.guild.id, message.guild.name].some(item => client.config.whitelistedServers.includes(item))) &&
        [message.guild.id, message.guild.name].some(item => !client.config.blacklistedServers.includes(item)) &&
        message.content.includes("countryball appeared!")
    ) {
        const time = Date.now()
        const img = Array.from(message.attachments)[0][1].url;
        
        const name = await compareWithFolderImages(img, './balls');
        const edited = name.replace('.png.bin', '');

        const randomTimeout = Math.floor(Math.random() * (client.config.timeout[1] - client.config.timeout[0] + 1)) + client.config.timeout[0] || 10;

        setTimeout(async () => {
            const btn = await message.clickButton();
            client.timers.set(btn.id, time);
            client.names.set(btn.id, edited);
        }, randomTimeout);
    }
});


client.on("messageUpdate", async (old, message) => {
    if (message.author.id !== "999736048596816014") return;
    if (message.content.includes(`<@${client.user.id}>`)) {
        const match = message.content.match(/\*\*(.+?)!\*\* `\((#[A-F0-9]+), ([^`]+)\)`/)
        console.log(`Caught ${match[1]} (${match[2]} . ${match[3]})`)
    }
})


client.on('interactionModalCreate', async modal => {
    await waitForMap(modal.id)
    await modal.components[0].components[0].setValue(client.names.get(modal.id));
    await modal.reply();
    console.log(`Caught ${client.names.get(modal.id)} in ${Math.round((Date.now() - client.timers.get(modal.id)) / 100) / 10} seconds`)
    await client.names.delete(modal.id)
    await client.timers.delete(modal.id)
})

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

process.on('unhandledRejection', (reason, promise) => {return console.log(reason)});process.on('rejectionHandled', (promise) => {return console.log(promise)});process.on("uncaughtException", (err, origin) => {return console.log(err)});process.on('uncaughtExceptionMonitor', (err, origin) => {return console.log(err)});