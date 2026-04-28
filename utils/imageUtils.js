// src/utils/imageUtils.js

// Pre-compute all product images in the public folder using Vite's glob import
// We use ?url to get the URL string, and import: 'default' to get the actual value directly
const allImagesGlob = import.meta.glob('/public/products/**/*.webp', {
    eager: true,
    query: '?url',
    import: 'default'
});

/**
 * Extracts all images for a given product folder, sorted by numeric suffix.
 * @param {string} mainImageUrl - The primary image URL from the product data
 * @returns {string[]} Array of sorted image URLs
 */
export const getProductImages = (mainImageUrl) => {
    if (!mainImageUrl) return [];

    // Parse folder name from URL (e.g., /products/dema-bm/img.webp -> dema-bm)
    // Works with relative paths. If it's a full URL to another domain, it will fail gracefully.
    const match = mainImageUrl.match(/^\/products\/([^/]+)\//);
    if (!match) return [mainImageUrl];

    const folderName = match[1];
    const folderPattern = `/public/products/${folderName}/`;

    let productImages = Object.keys(allImagesGlob)
        .filter(path => path.startsWith(folderPattern))
        .map(path => path.replace('/public', '')); // Strip /public to create a valid public path

    if (productImages.length === 0) {
        return [mainImageUrl];
    }

    // Sort images by numeric suffix
    // Example: bm.jpg -> 0, bm_1.jpg -> 1, bm_2.jpg -> 2
    productImages.sort((a, b) => {
        const getSuffix = (url) => {
            const numMatch = url.match(/_(\d+)\.[a-zA-Z0-9]+$/);
            return numMatch ? parseInt(numMatch[1], 10) : 0;
        };
        return getSuffix(a) - getSuffix(b);
    });

    // Ensure the main image is included if glob somehow missed it
    if (!productImages.includes(mainImageUrl)) {
        // If main image doesn't have a numeric suffix, put it first
        const numMatch = mainImageUrl.match(/_(\d+)\.[a-zA-Z0-9]+$/);
        if (!numMatch) {
            productImages = [mainImageUrl, ...productImages];
        } else {
            productImages.push(mainImageUrl);
        }
    }

    // Deduplicate just in case
    return [...new Set(productImages)];
};
