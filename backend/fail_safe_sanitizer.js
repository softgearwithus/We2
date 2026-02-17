const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Initial cleanup to remove all backslashes before backticks (undoing mess)
// This might affect intentional escaped backticks, but in our seeder strings they are mostly for wrapping.
content = content.replace(/\\+"/g, '"'); // Fix corrupted JSON if any
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$\{/g, '${');

// Also handle the corrupted JSON.stringify calls from the previous failed run
// If we have content: "...", we should turn it back to raw if possible.
// But it's easier to just find the NEXT topicId and start over.

const markers = ["content:", "theory:", "desc:"];

let newContent = "";
let lastIndex = 0;

// Since we might have messed up formatting (mixed " and ` and JSON.stringify),
// We'll search for the markers and the next topicId.

const topicIds = [
    'technology-stacks', 'dsa-topics', 'system-design-topics', 'aiml-topics',
    'aptitude-topics', 'datascience-topics', 'blockchain-topics',
    'programming-python-chapters',
    'programming-python-module-0', 'programming-python-module-1', 'programming-python-module-2',
    'programming-python-module-3', 'programming-python-module-4', 'programming-python-module-5',
    'programming-python-module-6', 'programming-python-module-7',
    'programming-javascript-chapters',
    'programming-javascript-module-0', 'programming-javascript-module-1', 'programming-javascript-module-2',
    'programming-javascript-module-3', 'programming-javascript-module-4', 'programming-javascript-module-5',
    'programming-javascript-module-6', 'programming-javascript-module-7'
    // ... add more as needed or use a generic search
];

// Instead of hardcoding all IDs, let's find all topicId: '...'
const allModuleStarts = [];
const idRegex = /topicId:\s*'([^']+)'/g;
let m;
while ((m = idRegex.exec(content)) !== null) {
    allModuleStarts.push({ id: m[1], index: m.index });
}

for (let i = 0; i < allModuleStarts.length; i++) {
    const current = allModuleStarts[i];
    const next = allModuleStarts[i + 1];

    // Append code up to the current module start
    newContent += content.substring(lastIndex, current.index);

    // Get the whole block for this module
    const blockEnd = next ? next.index : content.lastIndexOf(']');
    let block = content.substring(current.index, blockEnd);

    // Within this block, find any of the content markers and fix them
    markers.forEach(marker => {
        // We look for marker followed by either ` or " or JSON.stringify(
        // Actually, we can just look for the FIRST value start after the marker.
        const markerIdx = block.indexOf(marker);
        if (markerIdx === -1) return;

        const valueStartOffset = markerIdx + marker.length;
        const remainingInBlock = block.substring(valueStartOffset);

        // Find if it's currently a template literal, a double quoted string, or JSON.stringify
        const templateStart = remainingInBlock.indexOf('`');
        const jsonStart = remainingInBlock.indexOf('JSON.stringify(');
        const quoteStart = remainingInBlock.indexOf('"');

        let valStart = -1;
        let type = "";

        if (templateStart !== -1 && (jsonStart === -1 || templateStart < jsonStart) && (quoteStart === -1 || templateStart < quoteStart)) {
            valStart = templateStart;
            type = "template";
        } else if (jsonStart !== -1 && (quoteStart === -1 || jsonStart < quoteStart)) {
            valStart = jsonStart;
            type = "json";
        } else if (quoteStart !== -1) {
            valStart = quoteStart;
            type = "quote";
        }

        if (valStart === -1) return;

        // Find the END of this value inside the remaining block
        // Since it's a seeder, each property usually ends with , followed by newline or }
        // We can look for the LAST ` or " or ) before the end of the block property definition
        // property definition ends with \n + spaces + [},]

        let valEnd = -1;
        if (type === "template") {
            // Find the VERY LAST backtick in this block before the next topicId or }
            // Actually, usually it's before a comma or brace.
            valEnd = remainingInBlock.lastIndexOf('`');
        } else if (type === "json") {
            valEnd = remainingInBlock.lastIndexOf(')');
        } else if (type === "quote") {
            valEnd = remainingInBlock.lastIndexOf('"');
        }

        if (valEnd === -1 || valEnd <= valStart) return;

        // Extract raw string.
        // If it was already JSON.stringify, we might need to parse it or just trust our deep dive content is in one of these.
        // Our goal is to make sure EVERY such field is a valid JSON.stringify call.

        let rawContent = "";
        if (type === "template" || type === "quote") {
            rawContent = remainingInBlock.substring(valStart + 1, valEnd);
        } else if (type === "json") {
            // extract the argument: JSON.stringify(...)
            const argStart = remainingInBlock.indexOf('(', valStart) + 1;
            const argEnd = valEnd;
            const arg = remainingInBlock.substring(argStart, argEnd);
            try {
                // If it's a literal string in code, eval it? NO.
                // Just use it as is if it's already a string, or parse if it's a JSON array.
                rawContent = eval(arg); // DANGEROUS but it's a seeder script we control. 
                // Wait, if it's a complex array of objects, we should keep it as is!
                // But the entity takes a STRING content.
                // So if it's already JSON.stringify(ARRAY), then its fine.
            } catch (e) {
                // If eval fails, just leave it alone.
                return;
            }
        }

        // Reconstruct field
        const prefix = block.substring(0, valueStartOffset + valStart);
        const suffix = block.substring(valueStartOffset + valEnd + 1);

        // Special case: If rawContent looks like an array or object string, 
        // and we want it to BE a JSON string in the DB, we use JSON.stringify twice? 
        // No, CourseContent.content is a string column.

        let finalValue = "";
        if (typeof rawContent === 'string') {
            finalValue = "JSON.stringify(" + JSON.stringify(rawContent) + ")";
        } else {
            // If it's an object/array, stringify it once.
            finalValue = "JSON.stringify(" + JSON.stringify(rawContent) + ")";
        }

        block = prefix + finalValue + suffix;
    });

    newContent += block;
    lastIndex = blockEnd;
}

newContent += content.substring(lastIndex);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Seeder fully sanitized and normalized to JSON.stringify calls.");
