if (process.argv.includes('--old') || process.argv.includes('--legacy') || process.argv.includes('-l') || process.argv.includes('-o')) {
    var sharp = require('sharp-legacy')
} else {
    var sharp = require('sharp');
}
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./logger.js')
/**
 * @param {String} url 
 * @returns the name of the image: British Empire.png.bin
 */
async function fetchAndProcessImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        
        return sharp(imageBuffer)
            .resize(32, 32)
            .grayscale()
            .removeAlpha()
            .raw()
            .toBuffer();
    } catch (error) {
        logger.error('Error fetching image:', error);
        console.log(error)
        throw error;
    }
}

// Lazy load preprocessed images one by one to reduce memory pressure
function* loadPreprocessedImagesLazy(folderPath) {
    const folderFiles = fs.readdirSync(folderPath);
    const files = folderFiles.filter(file => file.endsWith('.png.bin'))
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const buffer = fs.readFileSync(filePath);
        yield { filename: file, buffer };  // Lazy loading using generator
    }
}

// Efficient pixel-wise difference calculation using Buffer's built-in methods
function calculateDifference(buffer1, buffer2) {
    const view1 = new Uint8Array(buffer1);
    const view2 = new Uint8Array(buffer2);

    let totalDifference = 0;
    for (let i = 0; i < view1.length; i++) {
        totalDifference += Math.abs(view1[i] - view2[i]);
    }

    return totalDifference;
}

// Compare with batched processing to avoid memory spikes
async function compareWithFolderImages(url, maxDifference = 500) {
    try {
        const fetchedImage = await fetchAndProcessImage(url);
        const preprocessedImages = [
            ...loadPreprocessedImagesLazy('./balls/main'), 
            ...loadPreprocessedImagesLazy('./balls/temp'),
            ...loadPreprocessedImagesLazy('./balls/additionals')
        ]

        let bestMatch = null;
        let bestDifference = Infinity;

        // Lazy load images and process in small batches
        let batchSize = 3;
        let currentBatch = [];

        for (const preprocessed of preprocessedImages) {
            currentBatch.push(preprocessed);

            if (currentBatch.length === batchSize) {
                // Process the current batch
                currentBatch.forEach(preprocessed => {
                    const difference = calculateDifference(fetchedImage, preprocessed.buffer);

                    // Early exit on a near-perfect match
                    if (difference < maxDifference) {
                        return preprocessed.filename;
                    }

                    if (difference < bestDifference) {
                        bestDifference = difference;
                        bestMatch = preprocessed.filename;
                    }
                });

                // Clear the batch to free up memory
                currentBatch = [];
            }
        }

        // Process the remaining images (if any)
        if (currentBatch.length > 0) {
            currentBatch.forEach(preprocessed => {
                const difference = calculateDifference(fetchedImage, preprocessed.buffer);

                if (difference < maxDifference) {
                    return preprocessed.filename;
                }

                if (difference < bestDifference) {
                    bestDifference = difference;
                    bestMatch = preprocessed.filename;
                }
            });
        }

        return bestMatch;  // Return the best match after all comparisons
    } catch (error) {
        logger.error('Error during comparison:', error);
    }
}

module.exports = { compareWithFolderImages };