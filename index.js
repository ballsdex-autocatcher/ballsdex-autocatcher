const Discord = require("discord.js-selfbot-v13");
const client = new Discord.Client({checkUpdate: false});
const fs = require("fs");
const looksSame = require('looks-same');
const chalk = require("chalk")
const axios = require("axios")
const config = require("./config.json")
const https = require("https")
const imagesFolderPath = "./balls"
// const { QuickDB } = require("quick.db");
// const db = new QuickDB({ filePath: "./temporary.sqlite" });

const lastballs = [];

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

async function ncatch(text) {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    console.log(chalk.cyanBright("[Log] ") + chalk.blueBright(`[${year}/${month}/${date} - ${hours}:${minutes}:${seconds}] `) + chalk.blackBright(">> [ ") + chalk.hex("#c7c7c7")(text) + chalk.blackBright(" ]"))
    const embed = new Discord.MessageEmbed()
        .setTitle("Catched a new ball")
        .setDescription(text)
        .setTimestamp()
        .setColor("#00ad68")
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
    // Dear, Sir, Sexer, Laggron, Don't fuck yourself with changing the spawn message
    // Im updating the code and testing it every day
    if (message.content.includes("A wild countryball appeared!") && message.components[0].components[0].label.includes("C")) {
        const img = Array.from(message.attachments)[0][1].url;
        await lastballs.push(img)
        await message.clickButton();
    // ======================= OLD CODE ========================

        // const image = await axios.get(img, {responseType: 'arraybuffer'});
        // const base64Data = Buffer.from(image.data).toString('base64'); 
        // const btnclick = await message.clickButton();
        // await db.set(`${btnclick.id}.base64`, `${base64Data}`)
    }
})

// dont want to give me a star?

client.on("messageUpdate", async (old, message) => {
    if (message.author.id !== "999736048596816014") return; // its not from ballsdex
    if (message.content.includes(`<@${client.user.id}>`)) {
        const firstline = message.content.split("(`")[0]
        const name = firstline.split("You caught ")[1]
        ncatch(`Caught ${name.replace("!","")} at <#${message.channel.id}> (${message.guild?.name})`)
    }
})


client.on('interactionModalCreate', async modal => {

    const img = lastballs[lastballs.length - 1]
    const file = fs.createWriteStream(".temp.png")
    https.get(img, response => {
        response.pipe(file);
      
        file.on('finish', () => {
          file.close();
          fs.readdir(imagesFolderPath,async (err, files) => {
            if (err) throw err;
            files.forEach(async file => {
                // Skip any non-image files
                if (!file.match(/\.(png|jpg|jpeg)$/i)) return;
                // Load the current image file
                const {equal} = await looksSame('.temp.png', `./balls/${file}`);
                
                if (equal) {
                    await modal.components[0].components[0].setValue(file.replace(".png", ""));
                    await modal.reply();
                    
                }
                
            });
        });
        
        
        });
      }).on('error', err => {
        fs.unlink(imageName);
        console.error(`Error downloading image: ${err.message}`);
      });


    // ======================= OLD CODE ========================
    
    
    // setTimeout(async () => {
    //     const base64Data = await db.get(`${modal.id}.base64`)
    //     await db.delete(`${modal.id}`)
    //     fs.readdir("./balls/",async (err, files) => {

    //         files.forEach(async file => {

    //             file = `./balls/${file}`

    //             if (!file.match(/\.(png|jpg|jpeg)$/i)) return;

    //             const binarydata = fs.readFileSync(file); 
    //             const converted = new Buffer.from(binarydata).toString("base64");
        
    //             if (base64Data === converted) {

    //                 await modal.components[0].components[0].setValue(file.replace(".png", "").replace("./balls/", ""));
    //                 await modal.reply();

    //             }   

    //         });
    //     });        
    // }, 50) // laggron, please check my nudes: dsjglkrjfklsjgsrlrfhdsigfisrdfujajdksdufyuiuewio.github.io/nudes
})
    
process.on('unhandledRejection', (reason, promise) => {return});process.on('rejectionHandled', (promise) => {return});process.on("uncaughtException", (err, origin) => {return});process.on('uncaughtExceptionMonitor', (err, origin) => {return});    

client.login(config.token)