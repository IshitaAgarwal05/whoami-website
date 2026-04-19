require('dotenv').config({ path: '../.env' });
const inquirer = require('inquirer');
const supabase = require('../db/supabaseClient');
const axios = require('axios');

/**
 * WHOAMI INVENTORY MANAGEMENT CLI
 * Build with ❤️ for a premium terminal experience.
 */

const main = async () => {
    console.log('\n=======================================');
    console.log('📦 WHOAMI INVENTORY MANAGER');
    console.log('=======================================\n');

    if (!supabase) {
        console.error('❌ Supabase client not initialized. Check your .env setup.');
        return;
    }

    let exit = false;
    while (!exit) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: '📋 List all products', value: 'list-p' },
                    { name: '➕ Add new product', value: 'add-p' },
                    { name: '✏️ Edit existing product', value: 'edit-p' },
                    { name: '❌ Delete a product', value: 'delete-p' },
                    new inquirer.Separator(),
                    { name: '📦 List all combos', value: 'list-c' },
                    { name: '➕ Add new combo', value: 'add-c' },
                    { name: '❌ Delete a combo', value: 'delete-c' },
                    new inquirer.Separator(),
                    { name: '⚡ Flush Website Cache', value: 'flush' },
                    { name: '🚪 Exit', value: 'exit' }
                ]
            }
        ]);

        try {
            switch (action) {
                case 'list-p': await listProducts(); break;
                case 'add-p': await addProduct(); break;
                case 'edit-p': await editProduct(); break;
                case 'delete-p': await deleteProduct(); break;
                case 'list-c': await listCombos(); break;
                case 'add-c': await addCombo(); break;
                case 'delete-c': await deleteCombo(); break;
                case 'flush': await flushCache(); break;
                case 'exit': exit = true; break;
            }
        } catch (error) {
            console.error('\n❌ Operation failed:', error.message);
        }
    }

    console.log('\n👋 Goodbye! Stay Golden.\n');
};

// --- PRODUCT ACTIONS ---

const listProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('\n--- Current Products ---');
    if (data.length === 0) {
        console.log('No products found.');
    } else {
        const tableData = data.map(p => ({
            SKU: p.internal_id,
            Name: p.name,
            Price: `₹${p.price}`,
            Category: p.category,
            Stock: p.stock
        }));
        console.table(tableData);
    }
    console.log('------------------------\n');
};

const addProduct = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'internal_id', message: 'Internal ID / SKU (e.g. 15, BT-01):', validate: val => !!val || 'Required' },
        { type: 'input', name: 'name', message: 'Product Name:', validate: val => !!val || 'Required' },
        { type: 'input', name: 'description', message: 'Description:' },
        { type: 'number', name: 'price', message: 'Price (INR):', validate: val => !isNaN(val) || 'Enter a number' },
        { type: 'number', name: 'original_price', message: 'Original Price (Before discount):' },
        { type: 'input', name: 'use_case', message: 'Ideal For (UseCase):' },
        { type: 'input', name: 'category', message: 'Category (e.g. Heroic Artifacts):' },
        { type: 'input', name: 'material', message: 'Material (e.g. PLA Plastic):' },
        { type: 'input', name: 'dimensions', message: 'Dimensions (e.g. 10x8x6 cm):' },
        { type: 'input', name: 'weight', message: 'Weight (e.g. 81g):' },
        { type: 'input', name: 'image_url', message: 'Image Path (e.g. /products/xyz/img.jpg):' },
        { type: 'number', name: 'stock', message: 'Initial Stock:', default: 10 }
    ]);

    const { error } = await supabase.from('products').insert([answers]);
    if (error) throw error;
    console.log(`\n✅ Product "${answers.name}" added successfully!`);
};

const editProduct = async () => {
    const { data } = await supabase.from('products').select('internal_id, name');
    if (!data.length) return console.log('No products to edit.');

    const { targetId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'targetId',
            message: 'Select product to edit:',
            choices: data.map(p => ({ name: `${p.name} (SKU: ${p.internal_id})`, value: p.internal_id }))
        }
    ]);

    const product = (await supabase.from('products').select('*').eq('internal_id', targetId)).data[0];

    const updates = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Name:', default: product.name },
        { type: 'number', name: 'price', message: 'Price:', default: product.price },
        { type: 'number', name: 'original_price', message: 'Original Price:', default: product.original_price },
        { type: 'input', name: 'use_case', message: 'Ideal For:', default: product.use_case },
        { type: 'input', name: 'description', message: 'Description:', default: product.description },
        { type: 'input', name: 'category', message: 'Category:', default: product.category },
        { type: 'input', name: 'dimensions', message: 'Dimensions:', default: product.dimensions },
        { type: 'input', name: 'weight', message: 'Weight:', default: product.weight },
        { type: 'input', name: 'image_url', message: 'Image Path:', default: product.image_url },
        { type: 'number', name: 'stock', message: 'Stock:', default: product.stock }
    ]);

    const { error } = await supabase.from('products').update(updates).eq('internal_id', targetId);
    if (error) throw error;
    console.log(`\n✅ Product "${targetId}" updated!`);
};

const deleteProduct = async () => {
    const { data } = await supabase.from('products').select('internal_id, name');
    if (!data.length) return console.log('No products to delete.');

    const { targetId, confirm } = await inquirer.prompt([
        {
            type: 'list',
            name: 'targetId',
            message: 'Select product to DELETE:',
            choices: data.map(p => ({ name: `${p.name} (SKU: ${p.internal_id})`, value: p.internal_id }))
        },
        { type: 'confirm', name: 'confirm', message: '⚠️ Are you absolutely sure? This cannot be undone.', default: false }
    ]);

    if (!confirm) return console.log('Deletion cancelled.');

    const { error } = await supabase.from('products').delete().eq('internal_id', targetId);
    if (error) throw error;
    console.log(`\n✅ Product "${targetId}" removed from database.`);
};

// --- COMBO ACTIONS ---

const listCombos = async () => {
    const { data, error } = await supabase.from('combos').select('*');
    if (error) throw error;
    
    console.log('\n--- Current Combos ---');
    if (data.length === 0) {
        console.log('No combos found.');
    } else {
        const tableData = data.map(c => ({
            ID: c.internal_id,
            Name: c.name,
            Price: `₹${c.price}`,
            Active: c.is_active ? 'Yes' : 'No'
        }));
        console.table(tableData);
    }
    console.log('----------------------\n');
};

const addCombo = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'internal_id', message: 'Combo ID (e.g. UPS-99):' },
        { type: 'input', name: 'name', message: 'Combo Name:' },
        { type: 'input', name: 'description', message: 'Description:' },
        { type: 'number', name: 'price', message: 'Price:' },
        { type: 'number', name: 'original_price', message: 'Real Value (Original Price):' },
        { type: 'input', name: 'image_url', message: 'Image Path:' },
        { type: 'input', name: 'items_raw', message: 'Included Product IDs (comma separated):' }
    ]);

    const items = answers.items_raw.split(',').map(i => i.trim()).filter(Boolean);
    delete answers.items_raw;
    answers.items = items;

    const { error } = await supabase.from('combos').insert([answers]);
    if (error) throw error;
    console.log(`\n✅ Combo "${answers.name}" added!`);
};

const deleteCombo = async () => {
    const { data } = await supabase.from('combos').select('internal_id, name');
    if (!data.length) return console.log('No combos to delete.');

    const { targetId, confirm } = await inquirer.prompt([
        {
            type: 'list',
            name: 'targetId',
            message: 'Select combo to DELETE:',
            choices: data.map(c => ({ name: `${c.name} (${c.internal_id})`, value: c.internal_id }))
        },
        { type: 'confirm', name: 'confirm', message: '⚠️ Are you sure?', default: false }
    ]);

    if (!confirm) return console.log('Deletion cancelled.');
    const { error } = await supabase.from('combos').delete().eq('internal_id', targetId);
    if (error) throw error;
    console.log(`\n✅ Combo "${targetId}" deleted.`);
};

// --- UTILITIES ---

const flushCache = async () => {
    const reloadKey = process.env.RELOAD_API_KEY;
    const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

    if (!reloadKey) {
        console.log('⚠️ RELOAD_API_KEY not found in .env. Cannot flush cache remotely.');
        return;
    }

    console.log(`\n⚡ Triggering cache flush on ${backendUrl}...`);
    try {
        const response = await axios.post(`${backendUrl}/api/products/reload`, {}, {
            headers: { 'x-api-key': reloadKey }
        });
        console.log('✅ Response:', response.data.message);
    } catch (error) {
        console.error('❌ Cache flush failed:', error.response ? error.response.data : error.message);
    }
};

main();
