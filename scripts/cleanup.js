const axios = require('axios');

const STRAPI_BASE = 'http://localhost:1337';

async function cleanup() {
    try {
        console.log('🚀 Starting cleanup script...');

        // 1. Rename Personalized Gifts category to Customs (if exists) or create Customs
        let customsCatId;
        const catRes = await axios.get(`${STRAPI_BASE}/api/categorys?filters[name][$eq]=Personalized Gifts`);
        if (catRes.data.data && catRes.data.data.length > 0) {
            const oldCat = catRes.data.data[0];
            const oldCatDocId = oldCat.documentId || oldCat.id;
            console.log(` ✅ Found old category "Personalized Gifts" (ID: ${oldCatDocId}). Renaming to "Customs"...`);
            await axios.put(`${STRAPI_BASE}/api/categorys/${oldCatDocId}`, {
                data: { name: 'Customs', slug: 'customs' }
            });
            await axios.post(`${STRAPI_BASE}/api/categorys/${oldCatDocId}/actions/publish`);
            customsCatId = oldCatDocId;
        } else {
            // Check if Customs already exists
            const customsRes = await axios.get(`${STRAPI_BASE}/api/categorys?filters[name][$eq]=Customs`);
            if (customsRes.data.data && customsRes.data.data.length > 0) {
                const customs = customsRes.data.data[0];
                customsCatId = customs.documentId || customs.id;
                console.log(` ✅ Found existing "Customs" category (ID: ${customsCatId}).`);
            } else {
                console.log(` ❌ "Customs" category not found. Creating it...`);
                const res = await axios.post(`${STRAPI_BASE}/api/categorys`, {
                    data: { name: 'Customs', slug: 'customs', description: 'Customizable products made just for you by WhoAmI Studios' }
                });
                customsCatId = res.data.data.documentId || res.data.data.id;
                await axios.post(`${STRAPI_BASE}/api/categorys/${customsCatId}/actions/publish`);
            }
        }

        // 2. Delete unwanted PERS products (PERS-001 to 006, 008, 009)
        const unwantedSkus = ['PERS-001', 'PERS-002', 'PERS-003', 'PERS-004', 'PERS-005', 'PERS-006', 'PERS-008', 'PERS-009'];
        for (const sku of unwantedSkus) {
            // Fetch drafts too!
            const prodRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${sku}&publicationState=preview`);
            if (prodRes.data.data && prodRes.data.data.length > 0) {
                const prod = prodRes.data.data[0];
                const docId = prod.documentId || prod.id;
                console.log(` 🗑️ Deleting unwanted product: ${sku} (ID: ${docId})`);
                await axios.delete(`${STRAPI_BASE}/api/products/${docId}`);
            }
        }

        // 3. Move NFC Name Products (PERS-007) and Letter & Name Model (PERS-010) to Customs and Publish them
        const customSkus = ['PERS-007', 'PERS-010'];
        for (const sku of customSkus) {
            const prodRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${sku}&publicationState=preview`);
            if (prodRes.data.data && prodRes.data.data.length > 0) {
                const prod = prodRes.data.data[0];
                const docId = prod.documentId || prod.id;
                console.log(` 🛠️ Moving ${sku} to Customs and Publishing...`);
                await axios.put(`${STRAPI_BASE}/api/products/${docId}`, {
                    data: { category: customsCatId }
                });
                await axios.post(`${STRAPI_BASE}/api/products/${docId}/actions/publish`);
            }
        }

        // 4. Ensure all other products added in the previous 13-product list are published
        const otherNewSkus = [
            'CHRM-001', 'CHRM-002', 'CHRM-003', 'CHRM-004', 'KEY-001', 
            'COLL-001', 'COLL-002', 'CHRM-005', 'CHRM-006', 'BOOK-001', 
            'CHRM-007', 'CHRM-008'
        ];
        for (const sku of otherNewSkus) {
            const prodRes = await axios.get(`${STRAPI_BASE}/api/products?filters[sku][$eq]=${sku}&publicationState=preview`);
            if (prodRes.data.data && prodRes.data.data.length > 0) {
                const prod = prodRes.data.data[0];
                const docId = prod.documentId || prod.id;
                console.log(` 📢 Publishing ${sku}...`);
                try {
                    await axios.post(`${STRAPI_BASE}/api/products/${docId}/actions/publish`);
                } catch(e) {
                    console.log(`   (Already published or failed for ${sku})`);
                }
            }
        }

        console.log('✅ Cleanup completed successfully!');
    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
        if (err.response) {
            console.error(err.response.data);
        }
    }
}

cleanup();
