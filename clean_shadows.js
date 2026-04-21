const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/app/components/home');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Standardize large solid shadows to 4px
    content = content.replace(/shadow-\[12px_12px_0px_0px_#(202b20|ffa116)\]/g, 'shadow-[4px_4px_0_0_#$1]');
    content = content.replace(/shadow-\[8px_8px_0px_0px_#(202b20|ffa116)\]/g, 'shadow-[4px_4px_0_0_#$1]');
    content = content.replace(/shadow-\[6px_6px_0px_0px_#(202b20|ffa116)\]/g, 'shadow-[4px_4px_0_0_#$1]');
    
    // Also clean up generic 4px_4px_0px_0px to 4px_4px_0_0 for cleanliness
    content = content.replace(/shadow-\[4px_4px_0px_0px_#(202b20|ffa116)\]/g, 'shadow-[4px_4px_0_0_#$1]');
    content = content.replace(/shadow-\[2px_2px_0px_0px_#(202b20|ffa116)\]/g, 'shadow-[2px_2px_0_0_#$1]');

    // Replace border-4 with border-2 for a much cleaner/thinner look globally
    content = content.replace(/border-4/g, 'border-2');

    // Also reduce hover translations if they are overwhelming
    // e.g. -translate-y-2 or similar, but the user specifically disliked the 3D shadow.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    });
}

traverseDirectory(directoryPath);
console.log('Homepage shadow cleanup complete.');
