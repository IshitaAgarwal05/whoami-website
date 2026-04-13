import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, compact = false }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const FALLBACK_IMAGE = 'https://placehold.co/400x400';

    // Check if this product is already in the cart
    const cartItem = cartItems.find(item => item.ID === product.ID);
    const quantity = cartItem ? cartItem.quantity : 0;

    // Format price in INR
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Placeholder image if none provided
    const imageUrl = product.ImageURL || FALLBACK_IMAGE;

    // Determine tag
    const tag = product.Tag || (product.Price === 99 ? 'Identity' : null);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.ID, 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity <= 1) {
            removeFromCart(product.ID);
        } else {
            updateQuantity(product.ID, -1);
        }
    };

    return (
        <Link to={`/product/${product.ID}`} className={`product-card ${compact ? 'compact' : ''}`}>
            {tag && (
                <div className={`product-card-tag ${tag.toLowerCase()}`}>
                    {tag}
                </div>
            )}
            <div className="product-card-image">
                <img
                    src={imageUrl}
                    alt={product.Name}
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                    }}
                />
            </div>

            <div className="product-card-content">
                <div className="product-card-header">
                    <h3 className="product-card-title">{product.Name}</h3>
                </div>

                {!compact && (
                    <p className="product-card-description">
                        {product.Description.length > 80
                            ? `${product.Description.substring(0, 80)}...`
                            : product.Description}
                    </p>
                )}

                <div className="product-card-footer">
                    <div className="product-card-action-row">
                        <div className="product-card-pricing">
                            <span className="product-card-price">{formatPrice(product.Price)}</span>
                            {product.OriginalPrice && (
                                <span className="product-card-original-price">
                                    {formatPrice(product.OriginalPrice)}
                                </span>
                            )}
                        </div>

                        {quantity > 0 ? (
                            <div className="qty-stepper">
                                <button
                                    className="qty-btn qty-btn-minus"
                                    onClick={handleDecrement}
                                    title="Decrease quantity"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button
                                    className="qty-btn qty-btn-plus"
                                    onClick={handleIncrement}
                                    title="Increase quantity"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                className="add-to-cart-btn-sm"
                                onClick={handleAddToCart}
                                title="Quick Add"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
