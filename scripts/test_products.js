const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:1337/api/products?populate=*');
        const products = res.data.data;
        console.log(`Total products: ${products.length}`);
        
        products.forEach(p => {
            const cat = p.category ? p.category.name : 'Uncategorized';
            console.log(`- ${p.name} (SKU: ${p.sku}) -> Category: ${cat}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
