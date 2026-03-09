import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {

    const FALLBACK_IMAGE = 'https://placehold.co/400x400';

    console.log(product);
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

    return (
        <Link to={`/product/${product.ID}`} className="product-card">
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
                    <span className="product-card-category">{product.Category}</span>
                </div>

                <p className="product-card-description">
                    {product.Description.length > 80
                        ? `${product.Description.substring(0, 80)}...`
                        : product.Description}
                </p>

                <div className="product-card-footer">
                    <span className="product-card-material">{product.Material}</span>
                    <span className="product-card-price">{formatPrice(product.Price)}</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
