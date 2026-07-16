const axios = require('axios');

async function check() {
    try {
        const res = await axios.get('http://localhost:1337/api/products?filters[sku][$eq]=PERS-007&populate=*');
        const prods = res.data.data;
        if (prods.length > 0) {
            console.log(`Product: ${prods[0].name}`);
            console.log(`Category: ${prods[0].category ? prods[0].category.name : 'null'}`);
        } else {
            console.log('Product not found in public API (might be draft or deleted)');
            // Check preview
            const res2 = await axios.get('http://localhost:1337/api/products?filters[sku][$eq]=PERS-007&publicationState=preview&populate=*');
            if (res2.data.data.length > 0) {
                 console.log(`FOUND AS DRAFT!`);
                 console.log(`Category: ${res2.data.data[0].category ? res2.data.data[0].category.name : 'null'}`);
            }
        }
    } catch(e) {
        console.error(e.message);
    }
}
check();
