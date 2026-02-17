const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// First, undo any previous escaping mess to get raw-ish content
// Actually, it's safer to just handle what's there but it's hard.
// Let's revert backslashes before backticks first.
content = content.replace(/\\`/g, '`');
// Also revert escaped ${ if any
content = content.replace(/\\\$\{/g, '${');

const markers = ["content: `", "theory: `", "desc: `"];

let currentIndex = 0;
let newContent = "";

while (currentIndex < content.length) {
    let earliestMarker = -1;
    let foundMarker = "";

    markers.forEach(m => {
        const idx = content.indexOf(m, currentIndex);
        if (idx !== -1 && (earliestMarker === -1 || idx < earliestMarker)) {
            earliestMarker = idx;
            foundMarker = m;
        }
    });

    if (earliestMarker === -1) {
        newContent += content.substring(currentIndex);
        break;
    }

    // Append up to key part
    const key = foundMarker.split(":")[0];
    newContent += content.substring(currentIndex, earliestMarker);

    let searchIndex = earliestMarker + foundMarker.length;

    // Find closing backtick
    const tailRegex = /`(\s*[\}\],])/;
    const tailMatch = content.substring(searchIndex).match(tailRegex);

    if (!tailMatch) {
        newContent += content.substring(searchIndex);
        break;
    }

    const relativeEndIdx = tailMatch.index;
    const rawText = content.substring(searchIndex, searchIndex + relativeEndIdx);

    // Convert to JSON stringify
    // We want output like: content: JSON.stringify("# Header\n\nContent...")
    // Actually, seeder usually stores as JSON string in DB, or as raw markdown.
    // If we use JSON.stringify(rawText), we get a string with literal quotes and escaped newlines.

    newContent += key + ": " + JSON.stringify(rawText);

    currentIndex = searchIndex + relativeEndIdx + 1; // After closing `
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Seeder sanitized with JSON.stringify for all content blocks.");
