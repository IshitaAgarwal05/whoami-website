/**
 * Generates a URL-friendly slug from a string.
 * Rules: lowercase, replace spaces with "-", remove special characters.
 */
export function slugify(text) {
    if (!text) return "";
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w-]+/g, "") // Remove all non-word chars
        .replace(/--+/g, "-"); // Replace multiple - with single -
}
