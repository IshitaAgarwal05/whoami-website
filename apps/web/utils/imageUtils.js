/**
 * Server-side utility to get all product images from the public folder.
 * Uses Node.js `fs` instead of Vite's `import.meta.glob`.
 *
 * This file should ONLY be imported in Server Components or server-side code.
 */
import fs from 'fs';
import path from 'path';

/**
 * Extracts all images for a given product folder, sorted by numeric suffix.
 * @param {string} mainImageUrl - The primary image URL from the product data
 * @returns {string[]} Array of sorted image URLs
 */
export const getProductImages = (mainImageUrl) => {
    if (!mainImageUrl) return [];

    // Parse folder name from URL (e.g., /products/dema-bm/img.webp -> dema-bm)
    const match = mainImageUrl.match(/^\/products\/([^/]+)\//);
    if (!match) return [mainImageUrl];

    const folderName = match[1];
    const folderPath = path.join(process.cwd(), 'public', 'products', folderName);

    try {
        const files = fs.readdirSync(folderPath)
            .filter(f => f.endsWith('.webp'))
            .map(f => `/products/${folderName}/${f}`);

        if (files.length === 0) {
            return [mainImageUrl];
        }

        // Sort images by numeric suffix
        // Example: bm.webp -> 0, bm_1.webp -> 1, bm_2.webp -> 2
        files.sort((a, b) => {
            const getSuffix = (url) => {
                const numMatch = url.match(/_(\\d+)\\.[a-zA-Z0-9]+$/);
                return numMatch ? parseInt(numMatch[1], 10) : 0;
            };
            return getSuffix(a) - getSuffix(b);
        });

        // Ensure the main image is included if fs somehow missed it
        if (!files.includes(mainImageUrl)) {
            const numMatch = mainImageUrl.match(/_(\\d+)\\.[a-zA-Z0-9]+$/);
            if (!numMatch) {
                files.unshift(mainImageUrl);
            } else {
                files.push(mainImageUrl);
            }
        }

        // Deduplicate just in case
        return [...new Set(files)];
    } catch (e) {
        // Folder doesn't exist or can't be read — return just the main image
        return [mainImageUrl];
    }
};
