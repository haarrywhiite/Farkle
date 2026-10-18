const fs = require('fs-extra');

async function build() {
    console.log('Building to www...');
    await fs.ensureDir('www');
    await fs.emptyDir('www');
    
    // Move web assets from src/ into the publishable www/ root
    const dirs = ['css', 'img', 'js', 'audio'];
    const files = ['index.html', 'manifest.json', 'sw.js'];
    
    for (const dir of dirs) {
        const from = `src/${dir}`;
        if (await fs.pathExists(from)) {
            console.log(`Copying ${from} to www/${dir}`);
            await fs.copy(from, `www/${dir}`);
        }
    }
    
    for (const file of files) {
        const from = `src/${file}`;
        if (await fs.pathExists(from)) {
            console.log(`Copying ${from} to www/${file}`);
            await fs.copy(from, `www/${file}`);
        }
    }
    
    console.log('Build complete.');
}

build().catch(console.error);
