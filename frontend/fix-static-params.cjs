const fs = require('fs');

const fixGenerateStaticParams = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('generateStaticParams')) {
        const insertParams = "\nexport function generateStaticParams() { return []; }\n";
        content += insertParams;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed ' + filePath);
    }
};

const findDynamicRoutes = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = dir + '/' + file;
        if (fs.statSync(fullPath).isDirectory()) {
            findDynamicRoutes(fullPath);
        } else if (file === 'page.tsx' && fullPath.includes('[')) {
            fixGenerateStaticParams(fullPath);
        }
    }
};

findDynamicRoutes('frontend/app');
