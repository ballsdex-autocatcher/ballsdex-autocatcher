const Discord = require("discord.js-selfbot-v13");
process.on('unhandledRejection', (reason, promise) => {let e = reason});process.on('rejectionHandled', (promise) => {let e = promise});process.on("uncaughtException", (err, origin) => {let e = err});process.on('uncaughtExceptionMonitor', (err, origin) => {let e = err});    
const client = new Discord.Client({checkUpdate: false});
const fs = require("fs");
const looksSame = require('looks-same');
const lastballs = [];
const https = require("https")
const imagesFolderPath = './balls';

client.once("ready", async (c) => {
    console.log(`${c.user.username} is ready`)
})

client.on("messageCreate", async (message) => {
    if (message.author.id !== "999736048596816014") return; // its not from ballsdex
    if (!message.content.includes("A wild countryball appeared!")) return; // not a ball
    const img = Array.from(message.attachments)[0][1].url;
    await lastballs.push(img)
    await message.clickButton();
    await console.log("Grabbed a ball")
})


client.on('interactionModalCreate', async modal => {
    const img = lastballs[lastballs.length - 1]
    console.log(img)
    const file = fs.createWriteStream(".temp.png")
    https.get(img, response => {
        response.pipe(file);
      
        file.on('finish', () => {
          file.close();
          console.log(`Image downloaded`);
          fs.readdir(imagesFolderPath,async (err, files) => {
            if (err) throw err;
            files.forEach(async file => {
                // Skip any non-image files
                if (!file.match(/\.(png|jpg|jpeg)$/i)) return;
                // Load the current image file
                const {equal} = await looksSame('.temp.png', `./balls/${file}`);
                
                if (equal) {
                    console.log(`./balls/${file}`)
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
      
        
    
})
    
    
client.login(require("./config.json").token)