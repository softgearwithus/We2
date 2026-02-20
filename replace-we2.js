const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/appx/Emble/frontend/app');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // specifically fixing the We2Hub split by span in about/page.tsx
    content = content.replace(/We2<span className="(.*?)">Hub<\/span>/g, 'EMBLE <span className="$1">Nexus</span>');
    // globally replace We2 as a word
    content = content.replace(/\bWe2\b/g, 'EMBLE');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
