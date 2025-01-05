const fs = require('fs');

const filePath = '../package.json';
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Please enter the new version');
  process.exit(1);
}

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading package.json:', err);
    process.exit(1);
  }

  try {
    const packageJson = JSON.parse(data);
    packageJson.version = newVersion;

    fs.writeFile(filePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8', (err) => {
      if (err) {
        console.error('Error writing package.json', err);
        process.exit(1);
      }
      console.log(`Changed package.json version to ${newVersion}`);
    });
  } catch (err) {
    console.error('Failed to process package.json:', err);
    process.exit(1);
  }
});
