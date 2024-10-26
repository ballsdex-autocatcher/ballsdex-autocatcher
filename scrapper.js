const sharp = require('sharp');
const ax = require('axios');
const fs = require('fs');
const path = require('path');

const axios = ax.create({
    baseURL: 'https://discord.com/api/v10',
    headers: {
      Authorization: process.env.token,
    },
});
  
var offset = 0
var fm = []

async function getFM() {
    const { data } = await axios.get('/channels/1280151904910966895/threads/search', {
        params: {
            offset: offset
        }
    });
    objects = 
    fm = [...fm, ...data.first_messages.map(fm => `${fm.attachments[0].url}_____${data.threads.find(thread => thread.id === fm.channel_id).name}.png`)]
    offset+= 25
    if (data['first_messages'].length > 24) {
        await getFM()
    } else {
        return fm
    }
}

function preprocessImagesFromUrls(imageData, outputFolder) {
    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Process all images in a for loop
    for (let i = 0; i < imageData.length; i++) {
        // Split URL and name
        const [imageUrl, imageName] = imageData[i].split('_____');

        axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer', // Ensure the response is a buffer
        })
        .then(response => {
            const imageBuffer = response.data;
            const outputFilePath = path.join(outputFolder, `${imageName}.bin`); // Save as <name>.bin

            // Resize to 32x32, grayscale, and remove alpha channel, then get raw pixel data
            return sharp(imageBuffer)
                .resize(32, 32)
                .grayscale()
                .removeAlpha()
                .raw() // Get raw pixel data
                .toBuffer()
                .then(processedImage => {
                    // Save the processed image as a binary file
                    fs.writeFileSync(outputFilePath, processedImage);
                    console.log(`Processed and saved: ${imageName}`);
                })
                .catch(error => {
                    console.error(`Error processing image: ${imageName}`, error.message);
                });
        })
        .catch(error => {
            console.error(`Error fetching image from ${imageUrl}:`, error.message);
        });
    }
}


(async () => {
    await getFM()
    preprocessImagesFromUrls(fm, './balls')
})()