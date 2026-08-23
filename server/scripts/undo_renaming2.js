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
            if (file.includes('WhatsApp Image_')) {
                // I need to change `WhatsApp Image_2026-06-27_at_19.43.53.jpeg` back to `WhatsApp Image 2026-06-27 at 19.43.53.jpeg`
                // Let's just replace all underscores with spaces, except the one before the extension? No, there are no other underscores in the original names.
                // Wait, were there any underscores? No, original was `WhatsApp Image 2026-06-27 at 19.43.53 (1).jpeg`. No underscores at all.
                const newName = file.replace(/_/g, ' ');
                fs.renameSync(path.join(p, file), path.join(p, newName));
                console.log(`Reverted file name: ${newName}`);
            }
        }
    }

    const { data: products } = await supabase.from('products').select('internal_id, image_url');
    for (let product of products) {
        if (product.image_url && product.image_url.includes('WhatsApp Image_')) {
            const newUrl = product.image_url.replace(/_/g, ' ');
            await supabase.from('products').update({ image_url: newUrl }).eq('internal_id', product.internal_id);
            console.log(`Reverted DB URL: ${newUrl}`);
        }
    }

    console.log('Undid the extra renaming fully!');
    process.exit(0);
}

undoExtras();
