const fs = require('fs');
const path = require('path');

const productsDumpPath = path.join(__dirname, '../services/api/data/products_dump.json');
const blogPostsPath = path.join(__dirname, '../services/api/data/blog_posts.json');
const backupPath = path.join(__dirname, '../database/backup_legacy.json');

async function backup() {
    try {
        console.log('📦 Starting backup of legacy content...');
        
        let products = [];
        let combos = [];
        if (fs.existsSync(productsDumpPath)) {
            const productsContent = fs.readFileSync(productsDumpPath, 'utf8');
            const parsed = JSON.parse(productsContent);
            products = parsed.products || [];
            combos = parsed.combos || [];
            console.log(` - Read ${products.length} products and ${combos.length} combos from products_dump.json`);
        } else {
            console.warn(' ⚠️ products_dump.json not found!');
        }

        let blogs = [];
        if (fs.existsSync(blogPostsPath)) {
            const blogContent = fs.readFileSync(blogPostsPath, 'utf8');
            blogs = JSON.parse(blogContent);
            console.log(` - Read ${blogs.length} blog posts from blog_posts.json`);
        } else {
            console.warn(' ⚠️ blog_posts.json not found!');
        }

        const backupData = {
            timestamp: new Date().toISOString(),
            products,
            combos,
            blogs
        };

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
        console.log(`✅ Backup successfully saved to ${backupPath}`);
    } catch (e) {
        console.error('❌ Backup failed:', e.message);
        process.exit(1);
    }
}

backup();
