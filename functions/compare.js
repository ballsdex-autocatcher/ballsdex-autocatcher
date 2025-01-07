const sharp = require(
    process.argv.includes('--old') || process.argv.includes('--legacy') || process.argv.includes('-l') || process.argv.includes('-o') 
    ? 'sharp-legacy' 
    : 'sharp'
);
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');
const config = require('../config.js')
/**
 * Fetches and processes the image for comparison.
 * @param {String} url
 * @returns {Buffer} Processed image buffer
 */
async function fetchAndProcessImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        return sharp(imageBuffer)
            .resize(64, 64, { fit: 'fill' })
            .grayscale()
            .removeAlpha()
            .raw()
            .toBuffer();
    } catch (error) {
        logger.error('Error fetching image:', error);
        throw error;
    }
}

/**
 * Loads preprocessed images lazily from a folder.
 * @param {String} folderPath
 * @returns {Generator} Lazy-loaded images
 */
function* loadPreprocessedImagesLazy(folderPath) {
    const folderFiles = fs.readdirSync(folderPath);
    const files = folderFiles.filter(file => file.endsWith('.png.bin'));
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const buffer = fs.readFileSync(filePath);
        yield { filename: file, buffer };
    }
}

/**
 * Calculates the Mean Squared Error (MSE) between two buffers.
 * @param {Buffer} buffer1
 * @param {Buffer} buffer2
 * @returns {Number} Mean Squared Error
 */
function calculateMSE(buffer1, buffer2) {
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);

    let mse = 0;
    for (let i = 0; i < view1.length; i++) {
        const diff = view1[i] - view2[i];
        mse += diff * diff;
    }
    return mse / view1.length;
}

/**
 * Compares an image URL against preprocessed images and finds the closest match.
 * @param {String} url
 * @param {Number} maxMSE Threshold for acceptable match
 * @returns {String|Boolean} Best matching image filename or false if no match
 */
async function compareWithFolderImages(url, maxMSE = 1000) {
    try {
        const fetchedImage = await fetchAndProcessImage(url);
        const preprocessedImages = [
            ...loadPreprocessedImagesLazy('./balls/main'),
            ...loadPreprocessedImagesLazy('./balls/temp'),
            ...loadPreprocessedImagesLazy('./balls/additionals')
        ];

        let bestMatch = null;
        let bestMSE = Infinity;

        for (const preprocessed of preprocessedImages) {
            const mse = calculateMSE(fetchedImage, preprocessed.buffer);

            if (mse < bestMSE) {
                bestMSE = mse;
                bestMatch = preprocessed.filename;
            }
        }
        if (bestMSE > maxMSE) {
            logger.info(`Tried to ignore ball with mse: ${bestMSE}`);
            if (config.forceReturnBestMatch) {
                return bestMatch;
            } else {
                return false;
        }
} else {
    return bestMatch;
}
    } catch (error) {
        logger.error('Error during comparison:', error);
        throw error;
    }
}

module.exports = { compareWithFolderImages };
