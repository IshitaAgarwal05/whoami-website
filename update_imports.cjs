const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace ../../src/components -> ../../components (etc)
    content = content.replace(/(\.\.\/)+src\//g, (match, p1) => {
        return match.replace('src/', '');
    });

    // Handle single ../src/
    content = content.replace(/\.\.\/src\//g, '../');

    // Handle legacy-pages CSS imports
    content = content.replace(/legacy-pages\/[^\/]+\/([^\/]+\.css)/g, 'styles/$1');
    content = content.replace(/src\/index\.css/g, 'styles/index.css');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== 'archive_temp' && file !== 'server') {
                walkDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'app'));
walkDir(path.join(__dirname, 'components'));
walkDir(path.join(__dirname, 'context'));
walkDir(path.join(__dirname, 'utils'));
