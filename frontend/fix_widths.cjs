const fs = require('fs');
const path = require('path');

function fixCorruptedWidths(dir) {
    const files = fs.readdirSync(dir);
    let updatedCount = 0;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updatedCount += fixCorruptedWidths(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Revert max-w-full max-w-[XXXpx] to max-w-[XXXpx]
            content = content.replace(/max-w-full max-w-\[/g, 'max-w-[');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                updatedCount++;
                console.log(`[REVERTED] Fixed corrupted max-width in: ${fullPath.split('frontend/app/')[1] || fullPath}`);
            }
        }
    }
    return updatedCount;
}

console.log("Starting Mobile Adaptation Bug Fix...");
const count = fixCorruptedWidths(path.join(__dirname, 'app'));
console.log(`\nRevert complete! Repaired CSS max-width constraints in ${count} files.`);
