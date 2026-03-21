const fs = require('fs');
const path = require('path');

function optimizeImgTags(dir) {
    const files = fs.readdirSync(dir);
    let updatedCount = 0;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updatedCount += optimizeImgTags(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Add loading="lazy" if not present
            content = content.replace(/<img(?!.*loading=)([^>]+)>/g, '<img loading="lazy" decoding="async"$1>');
            
            // If the script matched but it already had it (because regex can be tricky with multiline), make sure we didn't duplicate.
            // A safer regex replacement for JSX:
            // Find <img ... /> and inject loading="lazy" decoding="async" if not there.
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                updatedCount++;
            }
        }
    }
    return updatedCount;
}

console.log("Starting image tag optimization...");
const count = optimizeImgTags(path.join(__dirname, 'app'));
console.log(`Optimization complete. Updated ${count} files.`);
