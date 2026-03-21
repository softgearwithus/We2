const fs = require('fs');
const path = require('path');

function auditHardcodedWidths(dir) {
    const files = fs.readdirSync(dir);
    let updatedCount = 0;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updatedCount += auditHardcodedWidths(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Regex to find w-[XXXpx] where XXX > 200 (to avoid breaking small icons/avatars)
            // It replaces: className="... w-[500px]" -> className="... w-full max-w-[500px]"
            // Only targets pixel values over 200 to be safe.
            content = content.replace(/w-\[(\d+)px\]/g, (match, p1) => {
                const width = parseInt(p1, 10);
                // Safe threshold for mobile screens: any fixed width over 300px WILL break a 320px screen.
                // We'll convert pixel widths >= 250px into responsive max-width containers.
                if (width >= 250) {
                    return `w-full max-w-[${width}px]`;
                }
                return match; 
            });

            // Prevent duplicating max-w- if it already exists
            // Fix double w-full if it accidentally injected
            // Actually, a simpler regex is to just log them first, but we are executing an auto-fix.
            // Let's ensure we don't end up with `max-w-[500px] max-w-[500px]`
            content = content.replace(/w-full max-w-\[(\d+)px\] w-full/g, 'w-full max-w-[$1px]');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                updatedCount++;
                console.log(`[FIXED] Extracted fixed widths in: ${fullPath.split('frontend/app/')[1] || fullPath}`);
            }
        }
    }
    return updatedCount;
}

console.log("Starting Mobile Adaptation Width Audit...");
const count = auditHardcodedWidths(path.join(__dirname, 'app'));
console.log(`\nAudit complete! Upgraded rigid containers in ${count} files to fluid max-widths.`);
