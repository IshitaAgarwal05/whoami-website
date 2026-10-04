/**
 * Server-side utility to get all product images from the public folder.
 * Uses Node.js `fs` instead of Vite's `import.meta.glob`.
 *
 * This file should ONLY be imported in Server Components or server-side code.
 *
 * Supports TWO formats for image_url in Supabase:
 *   1. Folder path (new, preferred): "/products/thing/"
 *   2. File path (legacy):           "/products/thing/thing.webp"
 *
 * In both cases this function will scan the folder and return all .webp files.
 */
import fs from 'fs';
import path from 'path';

/**
 * Given an image_url (either a folder path or a file path), returns all .webp
 * images found in that product folder, sorted naturally.
 *
 * @param {string} imageUrl - The image_url from the database (folder or file path)
 * @returns {string[]} Array of sorted image URLs
 */
export const getProductImages = (imageUrl) => {
    if (!imageUrl) return [];

    let folderPath;   // absolute path on disk
    let folderUrl;    // relative URL prefix, e.g. "/products/charms/toothless"

    const isFolderPath = imageUrl.endsWith('/') || !imageUrl.includes('.');

    if (isFolderPath) {
        // e.g. "/products/charms/toothless" or "/products/charms/toothless/"
        folderUrl = imageUrl.replace(/\/$/, ''); // strip trailing slash
        folderPath = path.join(process.cwd(), 'public', ...folderUrl.split('/').filter(Boolean));
    } else {
        // e.g. "/products/thing/thing.webp" — extract parent folder
        const match = imageUrl.match(/^(\/products\/.+)\/[^/]+$/);
        if (!match) return [imageUrl];
        folderUrl = match[1];
        folderPath = path.join(process.cwd(), 'public', ...folderUrl.split('/').filter(Boolean));
    }

    try {
        if (!fs.existsSync(folderPath)) {
            // Folder doesn't exist — return original url as-is if it was a file
            return isFolderPath ? [] : [imageUrl];
        }

        const files = fs.readdirSync(folderPath)
            .filter(f => f.toLowerCase().endsWith('.webp'))
            .map(f => `${folderUrl}/${f}`);

        if (files.length === 0) {
            return isFolderPath ? [] : [imageUrl];
        }

        // Natural sort: numeric suffix first, then alphabetically
        files.sort((a, b) => {
            const baseName = (url) => url.split('/').pop();
            const getNum = (url) => {
                const m = baseName(url).match(/(\d+)/);
                return m ? parseInt(m[1], 10) : Infinity;
            };
            const numDiff = getNum(a) - getNum(b);
            if (numDiff !== 0) return numDiff;
            return baseName(a).localeCompare(baseName(b));
        });

        return [...new Set(files)];
    } catch (e) {
        return isFolderPath ? [] : [imageUrl];
    }
};

/**
 * Returns just the first (thumbnail) image URL for a product.
 * Safe to call even when image_url is a folder path.
 *
 * @param {string} imageUrl - The image_url from the database
 * @returns {string|null}
 */
export const getFirstProductImage = (imageUrl) => {
    if (!imageUrl) return null;

    const isFolderPath = imageUrl.endsWith('/') || !imageUrl.includes('.');
    if (!isFolderPath) return imageUrl; // already a direct file path

    const images = getProductImages(imageUrl);
    return images.length > 0 ? images[0] : null;
};
