const fs = require('fs');
const path = require('path');

const cmsRoot = path.join(__dirname, '../apps/cms/src/api');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeApiFiles(apiName, isSingleType, schemaAttributes) {
    const apiPath = path.join(cmsRoot, apiName);
    const contentTypesPath = path.join(apiPath, 'content-types', apiName);
    const controllersPath = path.join(apiPath, 'controllers');
    const routesPath = path.join(apiPath, 'routes');
    const servicesPath = path.join(apiPath, 'services');

    ensureDir(contentTypesPath);
    ensureDir(controllersPath);
    ensureDir(routesPath);
    ensureDir(servicesPath);

    // Schema
    const schema = {
        kind: isSingleType ? 'singleType' : 'collectionType',
        collectionName: apiName.replace(/-/g, '_') + (isSingleType ? '' : 's'),
        info: {
            singularName: apiName,
            pluralName: apiName + 's',
            displayName: apiName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            description: `Schema for ${apiName}`
        },
        options: {
            draftAndPublish: !isSingleType
        },
        pluginOptions: {},
        attributes: schemaAttributes
    };

    fs.writeFileSync(
        path.join(contentTypesPath, 'schema.json'),
        JSON.stringify(schema, null, 2),
        'utf8'
    );

    // Controller
    const controllerContent = `import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::${apiName}.${apiName}');
`;
    fs.writeFileSync(path.join(controllersPath, `${apiName}.ts`), controllerContent, 'utf8');

    // Route
    const routeContent = `import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::${apiName}.${apiName}');
`;
    fs.writeFileSync(path.join(routesPath, `${apiName}.ts`), routeContent, 'utf8');

    // Service
    const serviceContent = `import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::${apiName}.${apiName}');
`;
    fs.writeFileSync(path.join(servicesPath, `${apiName}.ts`), serviceContent, 'utf8');

    console.log(`✅ Created API directories and files for: ${apiName}`);
}

// 1. Product
writeApiFiles('product', false, {
    name: { type: 'string', required: true },
    slug: { type: 'uid', targetField: 'name', required: true },
    description: { type: 'richtext' },
    mrp: { type: 'decimal' },
    selling_price: { type: 'decimal', required: true },
    cost_price: { type: 'decimal' },
    sku: { type: 'string', unique: true, required: true },
    stock: { type: 'integer', default: 0 },
    low_stock_threshold: { type: 'integer', default: 5 },
    material: { type: 'string' },
    weight: { type: 'decimal' },
    dimensions: { type: 'string' },
    printing_time: { type: 'string' },
    dispatch_time: { type: 'string' },
    delivery_estimate: { type: 'string' },
    color_options: { type: 'json' },
    material_options: { type: 'json' },
    customizable: { type: 'boolean', default: false },
    seo_title: { type: 'string' },
    seo_description: { type: 'text' },
    seo_keywords: { type: 'string' },
    search_keywords: { type: 'text' },
    featured_order: { type: 'integer', default: 0 },
    rating: { type: 'decimal', default: 5.0 },
    review_count: { type: 'integer', default: 0 },
    status: {
        type: 'enumeration',
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    soft_deleted: { type: 'boolean', default: false },
    thumbnail: { type: 'media', allowedTypes: ['images'], multiple: false },
    gallery: { type: 'media', allowedTypes: ['images'], multiple: true },
    variants: { type: 'json' },
    category: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::category.category',
        inversedBy: 'products'
    },
    collection: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::collection.collection',
        inversedBy: 'products'
    },
    related_products: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::product.product'
    }
});

// 2. Category
writeApiFiles('category', false, {
    name: { type: 'string', required: true },
    slug: { type: 'uid', targetField: 'name', required: true },
    description: { type: 'text' },
    image: { type: 'media', allowedTypes: ['images'], multiple: false },
    soft_deleted: { type: 'boolean', default: false },
    products: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::product.product',
        mappedBy: 'category'
    }
});

// 3. Collection
writeApiFiles('collection', false, {
    name: { type: 'string', required: true },
    slug: { type: 'uid', targetField: 'name', required: true },
    description: { type: 'text' },
    image: { type: 'media', allowedTypes: ['images'], multiple: false },
    soft_deleted: { type: 'boolean', default: false },
    products: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::product.product',
        mappedBy: 'collection'
    }
});

// 4. Blog
writeApiFiles('blog', false, {
    title: { type: 'string', required: true },
    slug: { type: 'uid', targetField: 'title', required: true },
    excerpt: { type: 'text', required: true },
    content: { type: 'richtext', required: true },
    image: { type: 'media', allowedTypes: ['images'], multiple: false },
    date: { type: 'date' },
    reading_time: { type: 'string' },
    tags: { type: 'json' },
    soft_deleted: { type: 'boolean', default: false }
});

// 5. FAQ
writeApiFiles('faq', false, {
    question: { type: 'string', required: true },
    answer: { type: 'text', required: true },
    category: { type: 'string', default: 'General' }
});

// 6. Testimonial
writeApiFiles('testimonial', false, {
    text: { type: 'text', required: true },
    author: { type: 'string', required: true },
    role: { type: 'string' }
});

// 7. Coupon
writeApiFiles('coupon', false, {
    code: { type: 'string', unique: true, required: true },
    discount_type: {
        type: 'enumeration',
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    value: { type: 'decimal', required: true },
    min_purchase: { type: 'decimal', default: 0.0 },
    max_discount: { type: 'decimal' },
    expiry_date: { type: 'date' },
    is_active: { type: 'boolean', default: true }
});

// 8. Announcement
writeApiFiles('announcement', false, {
    text: { type: 'string', required: true },
    type: {
        type: 'enumeration',
        enum: ['info', 'promo', 'critical'],
        default: 'info'
    },
    is_active: { type: 'boolean', default: true }
});

// 9. Career (Job Opening)
writeApiFiles('career', false, {
    title: { type: 'string', required: true },
    department: { type: 'string' },
    location: { type: 'string' },
    job_type: { type: 'string' },
    description: { type: 'richtext', required: true },
    is_open: { type: 'boolean', default: true },
    soft_deleted: { type: 'boolean', default: false },
    applications: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::application.application',
        mappedBy: 'career'
    }
});

// 10. Application
writeApiFiles('application', false, {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    phone: { type: 'string' },
    cover_letter: { type: 'text' },
    resume: { type: 'media', allowedTypes: ['files'], multiple: false },
    status: {
        type: 'enumeration',
        enum: ['applied', 'reviewing', 'interviewed', 'accepted', 'rejected'],
        default: 'applied'
    },
    career: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::career.career',
        inversedBy: 'applications'
    }
});

// 11. Site Configuration (Single Type)
writeApiFiles('site-configuration', true, {
    social_links: { type: 'json' },
    whatsapp_number: { type: 'string' },
    brand_email: { type: 'string' },
    shipping_policy: { type: 'text' },
    return_policy: { type: 'text' },
    privacy_policy: { type: 'text' },
    terms_and_conditions: { type: 'text' },
    seo_defaults: { type: 'json' }
});

// 12. Homepage (Single Type)
writeApiFiles('homepage', true, {
    hero_title: { type: 'string' },
    hero_subtitle: { type: 'string' },
    hero_button_text: { type: 'string' },
    hero_bg: { type: 'media', allowedTypes: ['images'], multiple: false },
    features: { type: 'json' }
});

// 13. Navigation (Single Type)
writeApiFiles('navigation', true, {
    links: { type: 'json' }
});

// 14. Footer (Single Type)
writeApiFiles('footer', true, {
    links: { type: 'json' },
    copyright_text: { type: 'string' }
});

// 15. Order
writeApiFiles('order', false, {
    order_number: { type: 'string', required: true, unique: true },
    status: { type: 'string', default: 'unfulfilled' },
    payment_status: { type: 'string', default: 'pending' },
    payment_method: { type: 'string' },
    payment_reference_id: { type: 'string' },
    shipping_address: { type: 'json' },
    billing_address: { type: 'json' },
    tax_breakdown: { type: 'json' },
    shipping_charges: { type: 'decimal', default: 0.00 },
    discount_applied: { type: 'decimal', default: 0.00 },
    coupon_used: { type: 'string' },
    invoice_number: { type: 'string' },
    packing_status: { type: 'string', default: 'pending' },
    timeline: { type: 'json' },
    internal_notes: { type: 'text' },
    customer_notes: { type: 'text' },
    items: { type: 'json', required: true },
    total_amount: { type: 'decimal', required: true }
});

// 16. Customer
writeApiFiles('customer', false, {
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string', required: true, unique: true },
    phone: { type: 'string' },
    address: { type: 'json' }
});

// 17. Review
writeApiFiles('review', false, {
    author_name: { type: 'string', required: true },
    rating: { type: 'integer', default: 5 },
    comment: { type: 'text' },
    product: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::product.product'
    }
});

// 18. Contact Submission
writeApiFiles('contact-submission', false, {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    subject: { type: 'string' },
    message: { type: 'text', required: true },
    assigned_to: { type: 'string' },
    resolved: { type: 'boolean', default: false },
    archived: { type: 'boolean', default: false },
    reply_status: { type: 'string', default: 'pending' }
});

// 19. Newsletter Subscriber
writeApiFiles('newsletter-subscriber', false, {
    email: { type: 'string', required: true, unique: true },
    is_active: { type: 'boolean', default: true }
});

// 20. Audit Log
writeApiFiles('audit-log', false, {
    user_email: { type: 'string' },
    action: { type: 'string', required: true },
    entity_type: { type: 'string' },
    entity_id: { type: 'string' },
    changes: { type: 'json' }
});

// 21. Inventory Transaction
writeApiFiles('inventory-transaction', false, {
    product_sku: { type: 'string', required: true },
    type: {
        type: 'enumeration',
        enum: ['incoming', 'outgoing', 'manual_adjustment', 'sale', 'return'],
        required: true
    },
    quantity: { type: 'integer', required: true },
    reference_id: { type: 'string' },
    notes: { type: 'text' }
});
