import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../config';
import { useCart } from '../../context/CartContext';
import config from '../../config';
import { formatPrice } from '../../utils/formatPrice';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(getApiUrl(`/api/products/${id}`));
                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // formatPrice is imported from src/utils/formatPrice.js

    const handleBuyNow = () => {
        if (!product) return;
        const message = `Hi, I want to order:\n\n1. ${product.Name} – ${formatPrice(product.Price)} x ${quantity}\n\nTotal: ${formatPrice(product.Price * quantity)}\n\nName:\nCity:`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading"></div>
                        <p>Loading details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Oops!</h2>
                        <p>{error || 'Product not found'}</p>
                        <Link to="/products" className="back-btn">Back to Products</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="product-detail-nav">
                    <Link to="/products" className="back-link">
                        &larr; Back to Collection
                    </Link>
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/products">Products</Link>
                        <span>/</span>
                        <span className="current">{product.Name}</span>
                    </div>
                </div>

                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <div className="product-image-container">
                            <div className="product-image-glow"></div>
                            <div className="product-image">
                                <img src={product.ImageURL} alt={product.Name} />
                            </div>
                        </div>
                    </div>

                    <div className="product-info-section">
                        <div className="glass-card product-main-info">
                            <span className="product-category-badge">{product.Category}</span>
                            <h1 className="product-title">{product.Name}</h1>
                            <div className="product-price-tag">
                                <span className="price-label">Price</span>
                                <div className="info-price-row">
                                    {product.OriginalPrice && (
                                        <span className="info-original-price">{formatPrice(product.OriginalPrice)}</span>
                                    )}
                                    <span className="price-value">{formatPrice(product.Price)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card product-details-section">
                            <div className="detail-block">
                                <h3>Description</h3>
                                <p className="description-text">{product.Description}</p>
                            </div>

                            {product.UseCase && (
                                <div className="detail-block">
                                    <h3>Ideal For</h3>
                                    <p className="use-case-text">{product.UseCase}</p>
                                </div>
                            )}

                            <div className="detail-block">
                                <h3>Specifications</h3>
                                <div className="specs-grid">
                                    <div className="spec-item">
                                        <div className="spec-icon">M</div>
                                        <div className="spec-content">
                                            <span className="spec-label">Material</span>
                                            <span className="spec-value">{product.Material}</span>
                                        </div>
                                    </div>
                                    {product.Dimensions && (
                                        <div className="spec-item">
                                            <div className="spec-icon">D</div>
                                            <div className="spec-content">
                                                <span className="spec-label">Dimensions</span>
                                                <span className="spec-value">{product.Dimensions}</span>
                                            </div>
                                        </div>
                                    )}
                                    {product.Weight && (
                                        <div className="spec-item">
                                            <div className="spec-icon">W</div>
                                            <div className="spec-content">
                                                <span className="spec-label">Weight</span>
                                                <span className="spec-value">{product.Weight}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="product-actions">
                                <div className="quantity-controller">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>

                                <div className="action-buttons-group">
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => addToCart(product, quantity)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="buy-now-btn"
                                        onClick={handleBuyNow}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="product-note-card">
                            <div className="note-icon">!</div>
                            <div className="note-content">
                                <p>
                                    <strong>Handcrafted Item:</strong> Shipped within 3-5 business days.
                                    For inquiries, visit our <Link to="/contact">Contact</Link> page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
