const fs = require('fs');
const path = require('path');
const supabase = require('../db/supabaseClient');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function undoExtras() {
    const d = path.join(process.cwd(), 'public', 'products', 'charms');
    const folders = ['duck', 'heart', 'letter', 'toothless'];

    for (let f of folders) {
        const p = path.join(d, f);
        const files = fs.readdirSync(p);
        for (let file of files) {
            if (file.includes('WhatsApp_Image')) {
                const newName = file.replace(/WhatsApp_Image/g, 'WhatsApp Image');
                fs.renameSync(path.join(p, file), path.join(p, newName));
                console.log(`Reverted file name: ${newName}`);
            }
        }
    }

    const { data: products } = await supabase.from('products').select('internal_id, image_url');
    for (let product of products) {
        if (product.image_url && product.image_url.includes('WhatsApp_Image')) {
            const newUrl = product.image_url.replace(/WhatsApp_Image/g, 'WhatsApp Image');
            await supabase.from('products').update({ image_url: newUrl }).eq('internal_id', product.internal_id);
            console.log(`Reverted DB URL: ${newUrl}`);
        }
    }

    console.log('Undid the extra renaming!');
    process.exit(0);
}

undoExtras();
