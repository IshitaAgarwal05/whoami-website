const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js/dist/index.cjs');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const products = [
    {
        name: 'Hogwarts Booknook',
        price: 1199,
        original_price: 1499,
        category: 'Decor',
        description: 'Bring the magic of Hogwarts directly to your bookshelf. This beautifully detailed, miniature diorama slides perfectly between your books, featuring intricate detailing of the castle that casts a cozy vibe.',
        use_case: 'Bookshelf decor, Gifting for Potterheads',
        material: 'PLA',
        dimensions: '(5 x 6 x 16.5) cm',
        image_url: '/products/booknooks/hogwarts/',
        stock: 10,
        tags: []
    },
    {
        name: 'Cauldron',
        price: 699,
        original_price: 899,
        category: 'Decor',
        description: 'A dark, mystical cauldron perfect for your desk or display shelf. Great for holding small knick-knacks, pins, or just adding a magical aesthetic to your workspace.',
        use_case: 'Desk storage, Themed decor',
        material: 'PLA',
        dimensions: '(8 x 7 x 13) cm',
        image_url: '/products/cauldron/',
        stock: 10,
        tags: []
    },
    {
        name: 'Demogorgon',
        price: 649,
        original_price: 799,
        category: 'Decor',
        description: 'Straight out of the Upside Down! This terrifyingly detailed Demogorgon figure is a must-have for Stranger Things fans. Ready to strike fear (and awe) into anyone who sees it on your desk.',
        use_case: 'Collectible, Desk Decor',
        material: 'PLA',
        dimensions: '(15 x 7 x 15) cm',
        image_url: '/products/demogorgon/',
        stock: 10,
        tags: []
    },
    {
        name: 'Kunai Bookmark',
        price: 99,
        original_price: 149,
        category: 'Bookmarks',
        description: 'Slice through your reading list with this ninja-inspired Kunai bookmark. Thin enough to not damage your pages, but durable and striking. The perfect companion for your next manga or fantasy read.',
        use_case: 'Reading, Gifting for anime fans',
        material: 'PLA',
        dimensions: '(14.5 x 3 x 0.4) cm',
        image_url: '/products/kunai-bm/',
        stock: 10,
        tags: []
    }
];

async function run() {
    const { data: existing } = await supabase.from('products').select('internal_id');
    let maxId = 0;
    if (existing) {
        for (const item of existing) {
            const id = parseInt(item.internal_id);
            if (!isNaN(id) && id > maxId) maxId = id;
        }
    }

    for (let i = 0; i < products.length; i++) {
        products[i].internal_id = (maxId + 1 + i).toString();
        
        const { error } = await supabase.from('products').insert([products[i]]);
        if (error) {
            console.error('Failed to add', products[i].name, error);
        } else {
            console.log('Successfully added', products[i].name);
        }
    }
    process.exit(0);
}

run();
