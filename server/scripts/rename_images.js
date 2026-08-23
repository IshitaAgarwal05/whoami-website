const fs = require('fs'); 
const path = require('path'); 
const d = 'd:/Desktop/WhoAmI/WhoAmI_Website/public/products/charms'; 
const folders = ['duck', 'heart', 'letter', 'toothless']; 
for (let f of folders) { 
    const p = path.join(d, f); 
    const files = fs.readdirSync(p); 
    for (let file of files) { 
        if (file.includes(' ')) { 
            const newName = file.replace(/ /g, '_'); 
            fs.renameSync(path.join(p, file), path.join(p, newName)); 
            console.log(`Renamed ${file} to ${newName}`); 
        } 
    } 
}
