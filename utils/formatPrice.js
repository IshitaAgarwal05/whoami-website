/**
 * Shared price formatter for INR currency.
 * Used across ProductCard, ProductDetail, CartContext, Cart, CartDrawer.
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

export default formatPrice;
