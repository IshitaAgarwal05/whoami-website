import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, compact = false }) => {

    const FALLBACK_IMAGE = 'https://placehold.co/400x400';

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
                    {!compact && <span className="product-card-material">{product.Material}</span>}
                    <div className="product-card-pricing">
                        {product.OriginalPrice && (
                            <span className="product-card-original-price">
                                {formatPrice(product.OriginalPrice)}
                            </span>
                        )}
                        <span className="product-card-price">{formatPrice(product.Price)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
