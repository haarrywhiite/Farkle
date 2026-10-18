const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const START_PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.webmanifest': 'application/manifest+json'
};

function createServer() {
    return http.createServer((req, res) => {
        let safeUrl = req.url.split('?')[0].split('#')[0];
        if (safeUrl === '/') safeUrl = '/index.html';

        // Serve the package version live in dev (the build stamps www/version.json)
        if (safeUrl === '/version.json') {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8', 'Cache-Control': 'no-cache' });
                res.end(JSON.stringify({ version: pkg.version }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end('500 Internal Server Error');
            }
            return;
        }

        const safePath = path.normalize(decodeURIComponent(safeUrl)).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(__dirname, '..', 'src', safePath);

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end('404 Not Found');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });

            fs.createReadStream(filePath).pipe(res);
        });
    });
}

function startListening(port) {
    const server = createServer();

    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use, trying ${port + 1}...`);
            startListening(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(`Kingdom Dice is running at: ${url}`);
        console.log(`Open in your browser: ${url}`);

        if (process.argv.includes('--open')) {
            const startCommand = process.platform === 'win32'
                ? `start "" "${url}"`
                : process.platform === 'darwin'
                    ? `open "${url}"`
                    : `xdg-open "${url}"`;
            exec(startCommand);
        }
    });
}

startListening(START_PORT);
