const XLSX = require('xlsx');
const path = require('path');

// Product data with original keys preserved
const products = [
    {
        ID: 1,
        Name: 'Thing Hand',
        Description: '3D-printed replica of Thing from Wednesday, designed as a collectible desk artifact for fans of the series.',
        Price: 600,
        Material: 'PLA',
        UseCase: 'Display on a desk, shelf, or fandom corner as a collectible prop.',
        Category: 'Collectibles',
        ImageURL: '/products/thing/thing.JPG',
        Dimensions: '10cm x 8cm x 6cm',
        Weight: '90g'
    },
    {
        ID: 2,
        Name: 'Max Bookmark',
        Description: 'Stranger Things inspired bookmark themed around Max, made for readers who love the series.',
        Price: 180,
        Material: 'PLA',
        UseCase: 'Bookmark for novels, journals, and fandom collections.',
        Category: 'Bookmarks',
        ImageURL: '/products/st-bm/st-bm.JPG',
        Dimensions: '15cm x 4cm x 0.3cm',
        Weight: '12g'
    },
    {
        ID: 3,
        Name: 'Harry Potter Bookmark 1',
        Description: 'Harry Potter inspired bookmark designed for fans who want a magical touch while reading.',
        Price: 100,
        Material: 'PLA',
        UseCase: 'Use while reading books or keep as a collectible fandom accessory.',
        Category: 'Bookmarks',
        ImageURL: '/products/hp-bm1/hp-bm1.JPG',
        Dimensions: '15cm x 4cm x 0.3cm',
        Weight: '12g'
    },
    {
        ID: 4,
        Name: 'Harry Potter Bookmark 2',
        Description: 'Second Harry Potter inspired bookmark with a magical fandom theme, suitable for readers and collectors.',
        Price: 125,
        Material: 'PLA',
        UseCase: 'Bookmark for books and a collectible add-on for Harry Potter fans.',
        Category: 'Bookmarks',
        ImageURL: '/products/hp-bm2/hp-bm2.JPG',
        Dimensions: '15cm x 4cm x 0.3cm',
        Weight: '12g'
    },
    {
        ID: 5,
        Name: 'Golden Snitch',
        Description: '3D-printed Golden Snitch inspired by Harry Potter, made as a collectible decorative artifact.',
        Price: 350,
        Material: 'PLA',
        UseCase: 'Display piece for shelves, desks, and fandom setups.',
        Category: 'Collectibles',
        ImageURL: '/products/snitch-ball/snitch-ball.JPG',
        Dimensions: '8cm x 12cm x 8cm',
        Weight: '35g'
    },
    {
        ID: 6,
        Name: 'Sorting Hat',
        Description: 'Harry Potter inspired Sorting Hat model, recreated as a detailed collectible for fans.',
        Price: 250,
        Material: 'PLA',
        UseCase: 'Decor item for desks, bookshelves, and fandom collections.',
        Category: 'Collectibles',
        ImageURL: '/products/sorting-hat/sorting-hat.JPG',
        Dimensions: '11cm x 11cm x 9cm',
        Weight: '85g'
    },
    {
        ID: 7,
        Name: 'Nimbus 2000',
        Description: 'Harry Potter inspired Nimbus 2000 miniature, created as a decorative collectible prop.',
        Price: 900,
        Material: 'PLA',
        UseCase: 'Display as a miniature prop on desks, stands, or themed setups.',
        Category: 'Collectibles',
        ImageURL: '/products/nimbus/nimbus.JPG',
        Dimensions: '20cm x 3cm x 4cm',
        Weight: '40g'
    },
    {
        ID: 8,
        Name: 'Demadog',
        Description: 'Stranger Things inspired Demadog figure, made as a detailed collectible for fans of the Upside Down.',
        Price: 300,
        Material: 'PLA',
        UseCase: 'Collectible display model for desks, shelves, and themed rooms.',
        Category: 'Collectibles',
        ImageURL: '/products/demadog/demadog.JPG',
        Dimensions: '14cm x 8cm x 7cm',
        Weight: '95g'
    },
    {
        ID: 9,
        Name: 'Deathly Hallows Frame',
        Description: 'Harry Potter inspired decorative frame featuring the Deathly Hallows symbol.',
        Price: 300,
        Material: 'PLA',
        UseCase: 'Wall or shelf decor piece for fandom spaces and personal collections.',
        Category: 'Decor',
        ImageURL: '/products/wall-hanging/wall-hanging.JPG',
        Dimensions: '18cm x 18cm x 1.5cm',
        Weight: '120g'
    },
    {
        ID: 10,
        Name: 'Iron Throne',
        Description: 'Game of Thrones inspired Iron Throne model, recreated as a collectible display artifact.',
        Price: 800,
        Material: 'PLA',
        UseCase: 'Premium collectible for desk display, shelf decor, or themed setups.',
        Category: 'Collectibles',
        ImageURL: '/products/throne/throne.JPG',
        Dimensions: '16cm x 10cm x 8cm',
        Weight: '150g'
    },
    {
        ID: 11,
        Name: 'Golden Snitch Book Page Holder',
        Description: 'Harry Potter inspired book page holder with Golden Snitch theme, designed for readers and collectors.',
        Price: 150,
        Material: 'PLA',
        UseCase: 'Hold book pages open while reading and serve as a fandom accessory.',
        Category: 'Book Accessories',
        ImageURL: '/products/snitch-bh/snitch-bh.JPG',
        Dimensions: '7cm x 7cm x 2cm',
        Weight: '25g'
    },
    {
        ID: 12,
        Name: 'Groot',
        Description: 'Marvel inspired Groot figure, made as a decorative collectible for superhero fans.',
        Price: 450,
        Material: 'PLA',
        UseCase: 'Display on desks, shelves, or gift to Marvel fans.',
        Category: 'Collectibles',
        ImageURL: '/products/groot/groot.JPG',
        Dimensions: '12cm x 7cm x 7cm',
        Weight: '80g'
    }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(products);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Write to file
const filePath = path.join(__dirname, 'products.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`Excel file created successfully at: ${filePath}`);
console.log(`Total products: ${products.length}`);
console.log('Product categories included:');
console.log('- Bookmarks');
console.log('- Collectibles');
console.log('- Decor and book accessories');
console.log('- All products made from PLA');
