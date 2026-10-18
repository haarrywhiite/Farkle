const fs = require('fs');
const path = require('path');

// ICO files can contain PNG data directly. Embedding the existing 512px icon
// preserves the same artwork as src/img/icon.svg for the Windows app and installer.
const source = path.join(__dirname, '..', 'src', 'img', 'icon-512.png');
const destination = path.join(__dirname, 'icon.ico');
const png = fs.readFileSync(source);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // ICO image type
header.writeUInt16LE(1, 4); // One image

const entry = Buffer.alloc(16);
entry.writeUInt8(0, 0); // 0 represents 256px in ICO format
entry.writeUInt8(0, 1);
entry.writeUInt8(0, 2); // No palette
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(22, 12); // Header + directory entry

fs.writeFileSync(destination, Buffer.concat([header, entry, png]));
