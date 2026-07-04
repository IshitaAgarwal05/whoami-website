const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const supabase = require('../db/supabaseClient');

const userList = [
    "Golden snitch", "Castle bookmark", "Hogwarts bookmark", "Sorting hat", 
    "Nimbus 2000", "Deathly hallows", "Hanging keys", "Deathly hallows piece", 
    "Hp face keychain", "Sorting hat keychain", "Shaded hogwarts bookmark",
    "Stranger things wall hanging", "Demadog", "Demogorgon bookmark", "Max bookmark"
].map(s => s.toLowerCase());

async function testSupabase() {
    console.log("Fetching all products from Supabase...");
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
        console.error("Error fetching product:", error);
        return;
    }
    
    if (data && data.length > 0) {
        const foundProducts = data.filter(p => {
            const nameLower = p.name.toLowerCase();
            return userList.some(target => nameLower.includes(target) || target.includes(nameLower));
        });
        
        console.log(`\nFound ${foundProducts.length} matching products in the database:`);
        foundProducts.forEach(p => console.log(`- [ID: ${p.internal_id}] ${p.name}`));
        
        // Find which ones from userList were not found
        const foundNamesLower = foundProducts.map(p => p.name.toLowerCase());
        const missing = userList.filter(target => !foundNamesLower.some(name => name.includes(target) || target.includes(name)));
        
        if (missing.length > 0) {
            console.log(`\nMissing products from the list:`);
            missing.forEach(m => console.log(`- ${m}`));
        }
    } else {
        console.log("No products found.");
    }
}

testSupabase();
