const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const serverRequire = createRequire(path.join(serverDir, 'package.json'));

// Load Environment variables (.env, .env.local)
const envPaths = [
    path.join(rootDir, '.env'),
    path.join(rootDir, '.env.local'),
    path.join(serverDir, '.env')
];

let dotenv;
try {
    dotenv = serverRequire('dotenv');
} catch (e) {
    try {
        dotenv = require('dotenv');
    } catch {
        // Continue if dotenv not found
    }
}

if (dotenv) {
    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        }
    }
}

// Resolve dependencies using serverRequire
const inquirer = serverRequire('inquirer');
const { createClient } = serverRequire('@supabase/supabase-js');

let axios = null;
try {
    axios = serverRequire('axios');
} catch {
    axios = null;
}

// Supabase Client Setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Supabase credentials missing!');
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- ANSI Colors & Formatting Helpers ---
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    underline: '\x1b[4m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
    white: '\x1b[37m',
};

const printBanner = () => {
    console.clear();
    console.log(`
${c.cyan}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ${c.bold}${c.yellow}✨ WHOAMI PRODUCT & INVENTORY MANAGER ✨${c.reset}${c.cyan}                    ║
║   ${c.gray}Fast search • Seamless editing • Live Supabase sync${c.cyan}         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${c.reset}
`);
};

const readline = require('readline');

// --- Interactive Editable Input Helper ---
/**
 * Prompts user with the current value pre-filled directly into the terminal line buffer.
 * Allows using Left/Right arrows, Home/End, Backspace, inserting/modifying words seamlessly.
 */
const askEditable = (message, defaultValue = '', validate = null) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const promptText = `${c.cyan}?${c.reset} ${c.bold}${message}${c.reset} `;

        const ask = () => {
            rl.question(promptText, (answer) => {
                const finalVal = answer !== undefined && answer !== null ? answer.trim() : '';
                if (validate) {
                    const result = validate(finalVal);
                    if (result !== true && typeof result === 'string') {
                        console.log(`\n${c.red}>> ${result}${c.reset}`);
                        rl.close();
                        return askEditable(message, defaultValue, validate).then(resolve);
                    }
                }
                rl.close();
                resolve(finalVal);
            });

            if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
                rl.write(defaultValue.toString());
            }
        };

        ask();
    });
};

// --- In-Memory Product Cache for fast fuzzy searching ---
let cachedProducts = [];

const refreshProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`${c.red}❌ Error fetching products:${c.reset}`, error.message);
        return [];
    }
    cachedProducts = data || [];
    return cachedProducts;
};

// --- Smart Search Helper ---
/**
 * Searches products by partial name, SKU/internal_id, or category.
 * If 1 match -> returns [product]
 * If multiple -> returns [p1, p2, ...]
 * If none -> returns []
 */
const searchProductsLocally = (query) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);

    return cachedProducts.filter(p => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.internal_id || '').toString().toLowerCase();
        const category = (p.category || '').toLowerCase();

        // Exact SKU match
        if (sku === q) return true;

        // All search tokens present in name or category or sku
        return tokens.every(token => 
            name.includes(token) || 
            sku.includes(token) || 
            category.includes(token)
        );
    });
};

/**
 * Interactive product selector with partial name matching
 */
const selectProduct = async (promptMsg = 'Search product (type partial name or SKU):') => {
    while (true) {
        const { query } = await inquirer.prompt([
            {
                type: 'input',
                name: 'query',
                message: `${c.cyan}${promptMsg}${c.reset}`,
                validate: val => val.trim().length > 0 || 'Please enter search text or SKU'
            }
        ]);

        const matches = searchProductsLocally(query);

        if (matches.length === 0) {
            console.log(`\n${c.yellow}⚠️ No products found matching "${query}".${c.reset}`);
            const { retryAction } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'retryAction',
                    message: 'What would you like to do?',
                    choices: [
                        { name: '🔍 Try another search term', value: 'retry' },
                        { name: '📋 Choose from full product list', value: 'all' },
                        { name: '↩️ Back to main menu', value: 'cancel' }
                    ]
                }
            ]);

            if (retryAction === 'cancel') return null;
            if (retryAction === 'retry') continue;
            if (retryAction === 'all') {
                return await pickFromList(cachedProducts, 'Select a product from the list:');
            }
        } else if (matches.length === 1) {
            const match = matches[0];
            console.log(`\n${c.green}🎯 Found 1 match:${c.reset} ${c.bold}${match.name}${c.reset} ${c.gray}(SKU: ${match.internal_id} | Price: ₹${match.price} | Actual: ₹${match.original_price || '—'})${c.reset}\n`);
            return match;
        } else {
            console.log(`\n${c.cyan}🔎 Found ${matches.length} matching products:${c.reset}`);
            return await pickFromList(matches, 'Multiple products matched. Select one:');
        }
    }
};

const pickFromList = async (productsList, message) => {
    const choices = productsList.map(p => {
        const orig = p.original_price ? `₹${p.original_price}` : '—';
        const disc = `₹${p.price}`;
        const cat = p.category || 'General';
        const sku = p.internal_id ? `[SKU: ${p.internal_id}]` : '';
        return {
            name: `${p.name.padEnd(28)} ${sku.padEnd(12)} │ Price: ${disc.padEnd(6)} (Actual: ${orig.padEnd(6)}) │ ${cat}`,
            value: p
        };
    });

    choices.push(new inquirer.Separator());
    choices.push({ name: '↩️ Cancel & return to menu', value: null });

    const { selected } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selected',
            message: `${c.cyan}${message}${c.reset}`,
            pageSize: 15,
            choices
        }
    ]);

    return selected;
};

// --- Display Product Summary Card ---
const displayProductCard = (p) => {
    const orig = p.original_price ? `₹${p.original_price}` : `${c.gray}None${c.reset}`;
    const disc = `₹${p.price}`;
    const discountPercent = p.original_price && p.original_price > p.price
        ? ` (${Math.round(((p.original_price - p.price) / p.original_price) * 100)}% off)`
        : '';

    console.log(`
${c.cyan}┌─────────────────────────────────────────────────────────────┐${c.reset}
│ ${c.bold}${p.name.padEnd(59)}${c.reset} │
│ ${c.gray}SKU / ID:${c.reset} ${(p.internal_id || 'N/A').toString().padEnd(16)} ${c.gray}Category:${c.reset} ${(p.category || 'N/A').padEnd(25)} │
│ ${c.green}Selling Price:${c.reset} ${disc.padEnd(11)} ${c.yellow}Actual Price:${c.reset} ${(orig + discountPercent).padEnd(21)} │
│ ${c.gray}Stock:${c.reset} ${(p.stock ?? 'N/A').toString().padEnd(19)} ${c.gray}Material:${c.reset} ${(p.material || 'N/A').padEnd(25)} │
│ ${c.gray}Dimensions:${c.reset} ${(p.dimensions || 'N/A').padEnd(14)} ${c.gray}Weight:${c.reset} ${(p.weight || 'N/A').padEnd(27)} │
│ ${c.gray}Image:${c.reset} ${(p.image_url || 'N/A').padEnd(52)} │
│ ${c.gray}Ideal For:${c.reset} ${(p.use_case || 'N/A').padEnd(49)} │
│ ${c.gray}Description:${c.reset} ${(p.description ? p.description.slice(0, 46) + (p.description.length > 46 ? '...' : '') : 'N/A').padEnd(46)} │
${c.cyan}└─────────────────────────────────────────────────────────────┘${c.reset}
`);
};

// --- Actions ---

/**
 * 1. Quick Search & Edit Product
 */
const handleEditProduct = async () => {
    await refreshProducts();
    if (cachedProducts.length === 0) {
        console.log(`${c.yellow}No products in database.${c.reset}`);
        return;
    }

    const product = await selectProduct('Enter product name or SKU to edit:');
    if (!product) return;

    let current = { ...product };
    let continueEditing = true;

    while (continueEditing) {
        displayProductCard(current);

        const { editType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'editType',
                message: `${c.bold}What would you like to update on "${current.name}"?${c.reset}`,
                choices: [
                    { name: '💰 1. Quick Price Update (Selling Price & Actual Price)', value: 'price' },
                    { name: '🏷️ 2. Name & Description', value: 'name_desc' },
                    { name: '📁 3. Category', value: 'category' },
                    { name: '🖼️ 4. Image Path (image_url)', value: 'image' },
                    { name: '📦 5. Stock & Specs (Material, Dimensions, Weight, Ideal For)', value: 'specs' },
                    { name: '📝 6. Edit ALL Fields (Full Step-by-Step)', value: 'all' },
                    new inquirer.Separator(),
                    { name: '↩️ Finish / Back to Main Menu', value: 'back' }
                ]
            }
        ]);

        if (editType === 'back') break;

        let updates = {};

        if (editType === 'price') {
            const priceVal = await askEditable(
                'Selling / Discounted Price (INR ₹):',
                current.price?.toString(),
                val => (!isNaN(Number(val)) && Number(val) >= 0) || 'Enter a valid positive number'
            );
            const origPriceVal = await askEditable(
                'Actual / Compare-at Price (INR ₹) (leave empty for none):',
                current.original_price ? current.original_price.toString() : '',
                val => val === '' || (!isNaN(Number(val)) && Number(val) >= 0) || 'Enter a valid number or leave empty'
            );

            updates.price = Number(priceVal);
            updates.original_price = origPriceVal === '' ? null : Number(origPriceVal);
        } else if (editType === 'name_desc') {
            const nameVal = await askEditable(
                'Product Name:',
                current.name,
                val => val.trim().length > 0 || 'Product name cannot be empty'
            );
            const descVal = await askEditable(
                'Description:',
                current.description || ''
            );
            updates.name = nameVal.trim();
            updates.description = descVal.trim();
        } else if (editType === 'category') {
            // Get unique existing categories
            const categories = [...new Set(cachedProducts.map(p => p.category).filter(Boolean))];
            const catChoices = categories.map(cat => ({ name: cat, value: cat }));
            catChoices.push(new inquirer.Separator());
            catChoices.push({ name: '➕ Type a new category name...', value: '__new__' });

            const { catChoice } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'catChoice',
                    message: `Select Category (Current: ${current.category || 'None'}):`,
                    choices: catChoices,
                    default: current.category
                }
            ]);

            if (catChoice === '__new__') {
                const customCat = await askEditable('Enter new category name:', '', val => val.trim().length > 0 || 'Category name cannot be empty');
                updates.category = customCat.trim();
            } else {
                updates.category = catChoice;
            }
        } else if (editType === 'image') {
            const imgVal = await askEditable(
                'Image Path (e.g. /products/folder/image.webp):',
                current.image_url || ''
            );
            const trimmedImg = imgVal.trim();
            if (trimmedImg) {
                const diskPath = path.join(rootDir, 'public', trimmedImg.replace(/^\//, ''));
                if (!fs.existsSync(diskPath)) {
                    console.log(`\n${c.yellow}⚠️ Warning: File not found at "public${trimmedImg}".${c.reset}`);
                    const folderPart = trimmedImg.split('/')[2];
                    if (folderPart) {
                        const productsDir = path.join(rootDir, 'public', 'products');
                        if (fs.existsSync(productsDir)) {
                            const folders = fs.readdirSync(productsDir).filter(f => f.toLowerCase().includes(folderPart.toLowerCase().slice(0, 4)));
                            if (folders.length > 0) {
                                console.log(`${c.cyan}💡 Did you mean folder: ${folders.map(f => `/products/${f}/...`).join(', ')}?${c.reset}\n`);
                            }
                        }
                    }
                } else {
                    console.log(`${c.green}✓ Image verified on disk.${c.reset}`);
                }
            }
            updates.image_url = trimmedImg;
        } else if (editType === 'specs') {
            const stockVal = await askEditable('Stock count:', (current.stock ?? 10).toString(), val => !isNaN(Number(val)) || 'Must be a number');
            const matVal = await askEditable('Material (e.g. PLA):', current.material || 'PLA');
            const dimVal = await askEditable('Dimensions (e.g. (10 x 8 x 6) cm):', current.dimensions || '');
            const weightVal = await askEditable('Weight (e.g. 50g):', current.weight || '');
            const useVal = await askEditable('Ideal For / Use Case:', current.use_case || '');

            updates.stock = Number(stockVal);
            updates.material = matVal.trim();
            updates.dimensions = dimVal.trim();
            updates.weight = weightVal.trim();
            updates.use_case = useVal.trim();
        } else if (editType === 'all') {
            console.log(`\n${c.gray}Press Enter to keep current value or edit inline using Arrow keys/Backspace:${c.reset}`);
            const idVal = await askEditable('SKU / ID:', current.internal_id || '');
            const nameVal = await askEditable('Product Name:', current.name, v => v.trim().length > 0 || 'Required');
            const priceVal = await askEditable('Selling Price (₹):', current.price?.toString(), v => !isNaN(Number(v)) || 'Number required');
            const origVal = await askEditable('Actual/Compare Price (₹):', current.original_price?.toString() || '');
            const catVal = await askEditable('Category:', current.category || '');
            const descVal = await askEditable('Description:', current.description || '');
            const useVal = await askEditable('Ideal For:', current.use_case || '');
            const matVal = await askEditable('Material:', current.material || 'PLA');
            const dimVal = await askEditable('Dimensions:', current.dimensions || '');
            const weightVal = await askEditable('Weight:', current.weight || '');
            const imgVal = await askEditable('Image Path:', current.image_url || '');
            const stockVal = await askEditable('Stock:', (current.stock ?? 10).toString());

            updates = {
                internal_id: idVal.trim(),
                name: nameVal.trim(),
                price: Number(priceVal),
                original_price: origVal.trim() === '' ? null : Number(origVal),
                category: catVal.trim(),
                description: descVal.trim(),
                use_case: useVal.trim(),
                material: matVal.trim(),
                dimensions: dimVal.trim(),
                weight: weightVal.trim(),
                image_url: imgVal.trim(),
                stock: Number(stockVal)
            };
        }

        // Show Diff / Confirmation
        console.log(`\n${c.cyan}📋 Review Changes for "${current.name}":${c.reset}`);
        let hasChanges = false;
        for (const [key, val] of Object.entries(updates)) {
            if (current[key] !== val) {
                hasChanges = true;
                const oldVal = current[key] === null || current[key] === undefined ? `${c.gray}none${c.reset}` : current[key];
                const newVal = val === null || val === undefined ? `${c.gray}none${c.reset}` : val;
                console.log(`  • ${c.bold}${key}${c.reset}: ${c.red}${oldVal}${c.reset} ➔ ${c.green}${newVal}${c.reset}`);
            }
        }

        if (!hasChanges) {
            console.log(`  ${c.gray}No values were changed.${c.reset}\n`);
            continue;
        }

        const { confirmSave } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmSave',
                message: '💾 Save these changes to Supabase?',
                default: true
            }
        ]);

        if (confirmSave) {
            updates.updated_at = new Date().toISOString();
            
            const { error } = await supabase
                .from('products')
                .update(updates)
                .match({ id: current.id });

            if (error) {
                console.error(`\n${c.red}❌ Update failed:${c.reset}`, error.message);
            } else {
                console.log(`\n${c.green}✅ Successfully updated "${current.name}" in database!${c.reset}\n`);
                current = { ...current, ...updates };
                await refreshProducts();
            }
        } else {
            console.log(`\n${c.yellow}⚠️ Changes discarded.${c.reset}\n`);
        }

        const { nextStep } = await inquirer.prompt([
            {
                type: 'list',
                name: 'nextStep',
                message: 'Next action for this product:',
                choices: [
                    { name: '✏️ Edit more fields of this product', value: 'continue' },
                    { name: '🔍 Edit a different product', value: 'another' },
                    { name: '↩️ Return to Main Menu', value: 'main' }
                ]
            }
        ]);

        if (nextStep === 'continue') {
            continue;
        } else if (nextStep === 'another') {
            return await handleEditProduct();
        } else {
            continueEditing = false;
        }
    }
};

/**
 * 2. Add New Product
 */
const handleAddProduct = async () => {
    await refreshProducts();

    // Suggest next numeric SKU
    let nextSkuSuggestion = '1';
    const numericSkus = cachedProducts
        .map(p => parseInt(p.internal_id, 10))
        .filter(n => !isNaN(n));
    if (numericSkus.length > 0) {
        nextSkuSuggestion = (Math.max(...numericSkus) + 1).toString();
    }

    // Categories
    const categories = [...new Set(cachedProducts.map(p => p.category).filter(Boolean))];

    console.log(`\n${c.cyan}➕ Add New Product${c.reset}`);
    console.log(`${c.gray}Fill in the details below. Press Enter to use defaults.${c.reset}\n`);

    const name = await askEditable('Product Name:', '', val => val.trim().length > 0 || 'Product name is required');
    const internal_id = await askEditable(`Internal ID / SKU (Suggested: ${nextSkuSuggestion}):`, nextSkuSuggestion, val => val.trim().length > 0 || 'SKU is required');
    const price = await askEditable('Selling / Discounted Price (INR ₹):', '', val => (!isNaN(Number(val)) && Number(val) >= 0) || 'Enter a valid positive number');
    const original_price = await askEditable('Actual / Compare-at Price (INR ₹) (leave blank if none):', '', val => val === '' || (!isNaN(Number(val)) && Number(val) >= 0) || 'Enter a valid number or leave blank');

    // Category selection
    let category = '';
    const catChoices = categories.map(cat => ({ name: cat, value: cat }));
    catChoices.push({ name: '➕ Enter new category name...', value: '__new__' });

    const { catChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'catChoice',
            message: 'Category:',
            choices: catChoices
        }
    ]);

    if (catChoice === '__new__') {
        const customCat = await askEditable('Enter new category name:', '', v => v.trim().length > 0 || 'Required');
        category = customCat.trim();
    } else {
        category = catChoice;
    }

    const description = await askEditable('Description:');
    const use_case = await askEditable('Ideal For (e.g. Desk setup, gifts):');
    const material = await askEditable('Material:', 'PLA');
    const dimensions = await askEditable('Dimensions (e.g. (10 x 8 x 6) cm):');
    const weight = await askEditable('Weight (e.g. 50g):');
    const image_url = await askEditable('Image Path (e.g. /products/folder/name.webp):');
    const stock = await askEditable('Initial Stock:', '10');

    const newProduct = {
        name: name.trim(),
        internal_id: internal_id.trim(),
        price: Number(price),
        original_price: original_price.trim() === '' ? null : Number(original_price),
        category,
        description: description.trim(),
        use_case: use_case.trim(),
        material: material.trim() || 'PLA',
        dimensions: dimensions.trim(),
        weight: weight.trim(),
        image_url: image_url.trim(),
        stock: Number(stock) || 10,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    console.log(`\n${c.cyan}📋 New Product Summary:${c.reset}`);
    displayProductCard(newProduct);

    const { confirmAdd } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmAdd',
            message: '💾 Add this product to Supabase?',
            default: true
        }
    ]);

    if (confirmAdd) {
        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) {
            console.error(`\n${c.red}❌ Failed to add product:${c.reset}`, error.message);
        } else {
            console.log(`\n${c.green}✅ Product "${newProduct.name}" added successfully to database!${c.reset}\n`);
            await refreshProducts();
        }
    } else {
        console.log(`\n${c.yellow}⚠️ Addition cancelled.${c.reset}\n`);
    }
};

/**
 * 3. List & Filter Products
 */
const handleListProducts = async () => {
    await refreshProducts();
    if (cachedProducts.length === 0) {
        console.log(`${c.yellow}No products found.${c.reset}`);
        return;
    }

    const { filterType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'filterType',
            message: 'How would you like to view products?',
            choices: [
                { name: `📋 View all products (${cachedProducts.length} items)`, value: 'all' },
                { name: '📁 Filter by Category', value: 'category' },
                { name: '🔍 Search by Name / Keyword', value: 'search' }
            ]
        }
    ]);

    let displayList = cachedProducts;

    if (filterType === 'category') {
        const categories = [...new Set(cachedProducts.map(p => p.category).filter(Boolean))];
        const { chosenCat } = await inquirer.prompt([
            {
                type: 'list',
                name: 'chosenCat',
                message: 'Select Category:',
                choices: categories
            }
        ]);
        displayList = cachedProducts.filter(p => p.category === chosenCat);
    } else if (filterType === 'search') {
        const { keyword } = await inquirer.prompt([
            { type: 'input', name: 'keyword', message: 'Enter search keyword:' }
        ]);
        displayList = searchProductsLocally(keyword);
    }

    console.log(`\n${c.cyan}─── Found ${displayList.length} Products ───${c.reset}`);
    const tableData = displayList.map(p => ({
        SKU: p.internal_id || '—',
        Name: p.name.length > 25 ? p.name.slice(0, 22) + '...' : p.name,
        Price: `₹${p.price}`,
        Actual: p.original_price ? `₹${p.original_price}` : '—',
        Category: p.category || 'General',
        Stock: p.stock ?? '—'
    }));

    console.table(tableData);
    console.log('');

    const { followUp } = await inquirer.prompt([
        {
            type: 'list',
            name: 'followUp',
            message: 'Next step:',
            choices: [
                { name: '✏️ Edit one of these products', value: 'edit' },
                { name: '↩️ Back to main menu', value: 'back' }
            ]
        }
    ]);

    if (followUp === 'edit') {
        const selected = await pickFromList(displayList, 'Select product to edit:');
        if (selected) {
            displayProductCard(selected);
            await handleEditProduct();
        }
    }
};

/**
 * 4. Delete Product
 */
const handleDeleteProduct = async () => {
    await refreshProducts();
    const product = await selectProduct('Search product to DELETE:');
    if (!product) return;

    displayProductCard(product);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `${c.red}⚠️ Are you sure you want to PERMANENTLY DELETE "${product.name}" (SKU: ${product.internal_id})?${c.reset}`,
            default: false
        }
    ]);

    if (!confirm) {
        console.log(`${c.yellow}Deletion cancelled.${c.reset}`);
        return;
    }

    const { error } = await supabase.from('products').delete().match({ id: product.id });
    if (error) {
        console.error(`\n${c.red}❌ Delete failed:${c.reset}`, error.message);
    } else {
        console.log(`\n${c.green}✅ Product "${product.name}" deleted from database.${c.reset}\n`);
        await refreshProducts();
    }
};

/**
 * 5. Flush Redis / Backend API Cache
 */
const handleFlushCache = async () => {
    const reloadKey = process.env.RELOAD_API_KEY;
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

    if (!reloadKey) {
        console.log(`\n${c.yellow}⚠️ RELOAD_API_KEY not found in .env.${c.reset}`);
        console.log('If you are running the backend server with Redis caching, set RELOAD_API_KEY in .env.\n');
        return;
    }

    if (!axios) {
        console.log(`${c.yellow}⚠️ Axios not available. Cannot trigger remote reload.${c.reset}`);
        return;
    }

    console.log(`\n${c.cyan}⚡ Triggering cache flush at ${backendUrl}/api/products/reload...${c.reset}`);
    try {
        const response = await axios.post(`${backendUrl}/api/products/reload`, {}, {
            headers: { 'x-api-key': reloadKey }
        });
        console.log(`${c.green}✅ Cache flushed successfully:${c.reset}`, response.data.message);
    } catch (error) {
        console.log(`${c.yellow}ℹ️ Backend server might not be running locally (${backendUrl}).${c.reset}`);
        console.log(`Database is already updated in Supabase directly! (Error: ${error.message})\n`);
    }
};

// --- MAIN CONTROLLER LOOP ---
const main = async () => {
    printBanner();

    // Initial pre-load of products
    console.log(`${c.gray}Connecting to Supabase & caching products...${c.reset}`);
    await refreshProducts();
    console.log(`${c.green}✅ Loaded ${cachedProducts.length} products from Supabase.${c.reset}\n`);

    let running = true;
    while (running) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: `${c.bold}What would you like to do?${c.reset}`,
                pageSize: 10,
                choices: [
                    { name: '🔍 1. Search & Edit Product (Fuzzy name / SKU search)', value: 'edit' },
                    { name: '➕ 2. Add New Product', value: 'add' },
                    { name: '📋 3. List & Filter Products', value: 'list' },
                    { name: '🗑️ 4. Delete a Product', value: 'delete' },
                    { name: '⚡ 5. Flush Server Cache', value: 'flush' },
                    new inquirer.Separator(),
                    { name: '🚪 Exit', value: 'exit' }
                ]
            }
        ]);

        try {
            switch (action) {
                case 'edit':
                    await handleEditProduct();
                    break;
                case 'add':
                    await handleAddProduct();
                    break;
                case 'list':
                    await handleListProducts();
                    break;
                case 'delete':
                    await handleDeleteProduct();
                    break;
                case 'flush':
                    await handleFlushCache();
                    break;
                case 'exit':
                    running = false;
                    break;
            }
        } catch (err) {
            console.error(`\n${c.red}❌ An error occurred:${c.reset}`, err.message);
        }

        if (running) {
            console.log(`\n${c.gray}───────────────────────────────────────────────────${c.reset}\n`);
        }
    }

    console.log(`\n${c.cyan}👋 Happy selling! Exiting manager.${c.reset}\n`);
    process.exit(0);
};

// Execute if run directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    refreshProducts,
    searchProductsLocally
};
