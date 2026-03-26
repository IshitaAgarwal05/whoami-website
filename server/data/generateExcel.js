const XLSX = require('xlsx');
const path = require('path');

const products = [
    {
        ID: 1,
        Name: 'Thing Hand',
        Description: '3D-printed replica of Thing Hand, designed as a collectible desk artifact for fans of the series.',
        Price: 600,
        Material: 'PLA',
        UseCase: 'Display on a desk, shelf, or fandom corner as a collectible prop.',
        Category: 'Collectibles',
        ImageURL: '/products/thing/thing.JPG',
        Dimensions: '10cm x 8cm x 6cm',
        Weight: '81g'
    },
    {
        ID: 2,
        Name: 'Max Bookmark',
        Description: 'Bookmark themed around Max, made for readers who love the series.',
        Price: 200,
        Material: 'PLA',
        UseCase: 'Bookmark for novels, journals, and fandom collections.',
        Category: 'Bookmarks',
        ImageURL: '/products/st-bm/st-bm.JPG',
        Dimensions: '15cm x 4cm x 0.3cm',
        Weight: '13g'
    },
    {
        ID: 3,
        Name: 'Disney Bookmark',
        Description: 'Magical bookmark designed for fans who want a whimsical touch while reading.',
        Price: 200,
        Material: 'PLA',
        UseCase: 'Use while reading books or keep as a collectible fandom accessory.',
        Category: 'Bookmarks',
        ImageURL: '/products/hp-bm1/hp-bm1.JPG',
        Dimensions: '(16 x 5 x 0.2) cm',
        Weight: '8.33g'
    },
    {
        ID: 4,
        Name: 'Hogwarts Bookmark',
        Description: 'Hogwarts-themed bookmark with a magical fandom theme, suitable for readers and collectors.',
        Price: 150,
        Material: 'PLA',
        UseCase: 'Bookmark for books and a collectible add-on for fans.',
        Category: 'Bookmarks',
        ImageURL: '/products/hp-bm2/hp-bm2.JPG',
        Dimensions: '15cm x 4cm x 0.3cm',
        Weight: '9g'
    },
    {
        ID: 5,
        Name: 'Golden Snitch',
        Description: '3D-printed Golden Snitch made as a collectible decorative artifact.',
        Price: 350,
        Material: 'PLA',
        UseCase: 'Display piece for shelves, desks, and fandom setups.',
        Category: 'Collectibles',
        ImageURL: '/products/snitch-ball/snitch-ball.JPG',
        Dimensions: '(5 x 25 x 5) cm',
        Weight: '38g'
    },
    {
        ID: 6,
        Name: 'Sorting Hat',
        Description: 'Sorting Hat model, recreated as a detailed collectible for fans.',
        Price: 350,
        Material: 'PLA',
        UseCase: 'Decor item for desks, bookshelves, and fandom collections.',
        Category: 'Collectibles',
        ImageURL: '/products/sorting-hat/sorting-hat.JPG',
        Dimensions: '(7 x 8 x 8) cm',
        Weight: '35g'
    },
    {
        ID: 7,
        Name: 'Nimbus 2000',
        Description: 'Nimbus 2000 miniature, created as a decorative collectible prop.',
        Price: 900,
        Material: 'PLA',
        UseCase: 'Display as a miniature prop on desks, stands, or themed setups.',
        Category: 'Collectibles',
        ImageURL: '/products/nimbus/nimbus.JPG',
        Dimensions: '(30 x 5 x 15) cm',
        Weight: '125g'
    },
    {
        ID: 8,
        Name: 'Demadog',
        Description: 'Demadog figure, made as a detailed collectible for fans of the Upside Down.',
        Price: 450,
        Material: 'PLA',
        UseCase: 'Collectible display model for desks, shelves, and themed rooms.',
        Category: 'Collectibles',
        ImageURL: '/products/demadog/demadog.JPG',
        Dimensions: '14cm x 8cm x 7cm',
        Weight: '44g'
    },
    {
        ID: 9,
        Name: 'Deathly Hallows Wall Hanging',
        Description: 'Decorative frame featuring the Deathly Hallows symbol.',
        Price: 150,
        Material: 'PLA',
        UseCase: 'Wall or shelf decor piece for fandom spaces and personal collections.',
        Category: 'Decor',
        ImageURL: '/products/wall-hanging/wall-hanging.JPG',
        Dimensions: '(5 x 5 x 6) cm',
        Weight: '12g'
    },
    {
        ID: 10,
        Name: 'Iron Throne',
        Description: 'Iron Throne model, recreated as a collectible display artifact.',
        Price: 800,
        Material: 'PLA',
        UseCase: 'Premium collectible for desk display, shelf decor, or themed setups.',
        Category: 'Collectibles',
        ImageURL: '/products/throne/throne.JPG',
        Dimensions: '16cm x 10cm x 8cm',
        Weight: '120g'
    },
    {
        ID: 11,
        Name: 'Golden Snitch Book Page Holder',
        Description: 'Book page holder, designed for readers and collectors.',
        Price: 200,
        Material: 'PLA',
        UseCase: 'Hold book pages open while reading and serve as a fandom accessory.',
        Category: 'Book Accessories',
        ImageURL: '/products/snitch-bh/snitch-bh.JPG',
        Dimensions: '(15 x 3 x 1) cm',
        Weight: '12.8g'
    },
    {
        ID: 12,
        Name: 'Groot',
        Description: 'Groot figure, made as a decorative collectible for superhero fans.',
        Price: 450,
        Material: 'PLA',
        UseCase: 'Display on desks, shelves, or gift to fans.',
        Category: 'Collectibles',
        ImageURL: '/products/groot/groot.JPG',
        Dimensions: '12cm x 7cm x 7cm',
        Weight: '52g'
    }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(products);
XLSX.utils.book_append_sheet(wb, ws, 'Products');
const filePath = path.join(__dirname, 'products.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Excel file created at: ${filePath}`);