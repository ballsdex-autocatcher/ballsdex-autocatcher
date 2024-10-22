const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Preprocess all images in the folder by resizing, grayscaling, and saving raw buffers
async function preprocessFolderImages(inputFolder, outputFolder) {
    const files = fs.readdirSync(inputFolder);

    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Process all images in parallel
    await Promise.all(files.map(async (file) => {
        const inputFilePath = path.join(inputFolder, file);
        const outputFilePath = path.join(outputFolder, file + '.bin');

        // Resize to 32x32, grayscale, and remove alpha channel, then get raw pixel data
        const processedImage = await sharp(inputFilePath)
            .resize(32, 32)
            .grayscale()
            .removeAlpha()
            .raw() // Get raw pixel data
            .toBuffer();

        // Save the processed image as a binary file
        fs.writeFileSync(outputFilePath, processedImage);
        console.log(`Processed and saved: ${file}`);
    }));
}

// Example usage
const inputFolder = './balls';
const outputFolder = './newballs';
preprocessFolderImages(inputFolder, outputFolder)
    .then(() => console.log("Preprocessing complete!"))
    .catch((err) => console.error("Error during preprocessing:", err));
