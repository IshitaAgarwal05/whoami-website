'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { slugify } from '../../../utils/slugify';
import ImageCarousel from '../../../components/ImageCarousel/ImageCarousel';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import ProductCard from '../../../components/ProductCard/ProductCard';
import '../../../styles/ProductDetail.css';

const ProductDetailClient = ({ product, relatedProducts, whatsappNumber }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const handleBuyNow = () => {
        const message = `Hi, I want to order:\n\n1. ${product.Name} – ${formatPrice(product.Price)} x ${quantity}\n\nTotal: ${formatPrice(product.Price * quantity)}\n\nName:\nCity:`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    };

    const breadcrumbItems = [
        { label: product.Category || 'Products', href: `/categories/${slugify(product.Category || 'Products')}` },
        { label: product.Name }
    ];

    return (
        <div className="product-detail-page">
            <Breadcrumbs items={breadcrumbItems} />
            
            <div className="container">
                <div className="product-detail-nav-minimal">
                    <Link href={`/categories/${slugify(product.Category || 'Products')}`} className="back-link">
                        &larr; Back to {product.Category || 'Collection'}
                    </Link>
                </div>

                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <div className="product-image-container">
                            <div className="product-image-glow"></div>
                            <ImageCarousel imageUrl={product.ImageURL} productName={product.Name} />
                        </div>
                    </div>

                    <div className="product-info-section">
                        <div className="glass-card product-main-info">
                            <span className="product-category-badge">{product.Category}</span>
                            <h1 className="product-title">{product.Name}</h1>
                            <div className="product-price-tag">
                                <span className="price-label">Price</span>
                                <div className="info-price-row">
                                    <span className="price-value">{formatPrice(product.Price)}</span>
                                    {product.OriginalPrice && (
                                        <span className="info-original-price">{formatPrice(product.OriginalPrice)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card product-details-section">
                            <div className="detail-block">
                                <h3>Description</h3>
                                <p className="description-text">{product.Description}</p>
                            </div>

                            <div className="detail-block expanded-content">
                                <h3>Why This Product</h3>
                                <p className="description-text">
                                    This {product.Name} is more than just a {product.Category}. It's a statement of identity. 
                                    Handcrafted in Jaipur using premium {product.Material || 'materials'}, it bridges the gap between 
                                    fandom and fine desk aesthetics. Every curve and detail is inspired by the worlds you love, 
                                    designed to be a subtle yet powerful representation of your personality.
                                </p>
                            </div>

                            <div className="detail-block expanded-content">
                                <h3>Best For</h3>
                                <p className="description-text">
                                    {product.UseCase || `Perfect for your minimalist workspace or as a thoughtful gift for a fellow enthusiast. This ${product.Name} shines in home offices, gaming setups, or as a focal point on any shelf where identity matters more than generic decor.`}
                                </p>
                            </div>

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
                                    For inquiries, visit our <Link href="/contact">Contact</Link> page.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <div className="section-header">
                            <h2>You Might Also Like</h2>
                            <p>Handpicked artifacts from the same universe.</p>
                        </div>
                        <div className="products-grid">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.ID} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailClient;
