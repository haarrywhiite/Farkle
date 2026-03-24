const fs = require('fs-extra');

async function build() {
    console.log('Building to www...');
    await fs.ensureDir('www');
    await fs.emptyDir('www');
    
    const dirs = ['app', 'assets', 'css', 'img', 'js'];
    const files = ['index.html', 'manifest.json', 'sw.js'];
    
    for (const dir of dirs) {
        if (await fs.pathExists(dir)) {
            console.log(`Copying ${dir} to www/${dir}`);
            await fs.copy(dir, `www/${dir}`);
        }
    }
    
    for (const file of files) {
        if (await fs.pathExists(file)) {
            console.log(`Copying ${file} to www/${file}`);
            await fs.copy(file, `www/${file}`);
        }
    }
    
    console.log('Build complete.');
}

build().catch(console.error);
