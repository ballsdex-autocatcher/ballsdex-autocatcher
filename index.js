const Discord = require("discord.js-selfbot-v13");
process.on('unhandledRejection', (reason, promise) => {let e = reason});process.on('rejectionHandled', (promise) => {let e = promise});process.on("uncaughtException", (err, origin) => {let e = err});process.on('uncaughtExceptionMonitor', (err, origin) => {let e = err});    
const client = new Discord.Client({checkUpdate: false});
const fs = require("fs");
const chalk = require("chalk")
const https = require("https")
const config = require("./config.json")
let lastball = "British Empire"

if (config.webhook) {
    try {
        var webhook = new Discord.WebhookClient({ url: config.webhook })
    } catch {
        error("Webhook URL is not working, Ignoring it")
    }
} else {
    var webhook
}

async function log(text) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    console.log(chalk.cyanBright("[Log] ") + chalk.blueBright(`[${year}/${month}/${date} - ${hours}:${minutes}:${seconds}] `) + chalk.blackBright(">> [ ") + chalk.hex("#c7c7c7")(text) + chalk.blackBright(" ]"))
    const embed = new Discord.MessageEmbed()
        .setTitle("Log")
        .setDescription("```"+text+"```")
        .setTimestamp()
        .setColor("#42b0f5")
    try {
        webhook.send({content:" ", embeds: [embed]})
    } catch {
        return;
    }
    
}

async function error(text) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    console.log(chalk.red("[Error] ") + chalk.blueBright(`[${year}/${month}/${date} - ${hours}:${minutes}:${seconds}] `) + chalk.blackBright(">> [ ") + chalk.red(text) + chalk.blackBright(" ]"))
    const embed = new Discord.MessageEmbed()
    .setTitle("Error")
    .setDescription("```"+text+"```")
    .setTimestamp()
    .setColor("RED")
    try {
        webhook.send({content:" ", embeds: [embed]})
    } catch {
        return;
    }

}

async function warn(text) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    console.log(chalk.yellow("[Warning] ") + chalk.blueBright(`[${year}/${month}/${date} - ${hours}:${minutes}:${seconds}] `) + chalk.blackBright(">> [ ") + chalk.yellow(text) + chalk.blackBright(" ]"))
    const embed = new Discord.MessageEmbed()
        .setTitle("Warning")
        .setDescription("```"+text+"```")
        .setTimestamp()
        .setColor("YELLOW")
    try {
            webhook.send({content:" ", embeds: [embed]})
    } catch {
            return;
        }
    
}


client.once("ready", async (c) => {
    log(`${c.user.username} is ready`)
    if (c.ws.ping > 80) {
        warn("Your client websocket ping is higher than 80ms. It's recommanded to use better internet connection")
    }
})

client.on("messageCreate", async (message) => {
    if (message.author.id !== "999736048596816014") return; // its not from ballsdex
    if (message.content.includes("countryball") && Array.from(message.attachments)[0][1].url) {
        const img = Array.from(message.attachments)[0][1].url;
        lastball = img;
        await message.clickButton();
    }
    if (message.content.includes(`${client.user.id}`)) {
        const firstline = message.content.split("(`")[0]
        const name = firstline.split("You caught ")[1]

        log(`Caught ${name.replace("!","")}at <#${message.channel.id}> (${message.guild?.name})`)
    }
})


client.on('interactionModalCreate', async modal => {
    const img = lastball
    log("Processing the ball: "+img)
    const file = fs.createWriteStream("last-ball-image.png")
    https.get(img, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            fs.readdir("./balls/",async (err, files) => {
                if (err) throw err;
                files.forEach(async file => {
                    file = `./balls/${file}`
                    // Skip any non-image files
                    if (!file.match(/\.(png|jpg|jpeg)$/i)) return;
                    // Load the current image file
                    const filename = './last-ball-image.png';
                    const binarydata = fs.readFileSync(filename); 
                    const converted = new Buffer.from(binarydata).toString("base64");
                    const binarydata2 = fs.readFileSync(file); 
                    const converted2 = new Buffer.from(binarydata2).toString("base64");
            
                    if (converted === converted2) {
                        await modal.components[0].components[0].setValue(file.replace(".png", "").replace("./balls/", ""));
                        await modal.reply();
                    }   
                });
            });        
        });
    }).on('error', err => {
        fs.unlink(imageName);
        error(`Error downloading the ball.`);
    });
      
        
    
})
    
    
client.login(config.token)