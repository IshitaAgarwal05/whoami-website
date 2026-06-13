'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../utils/formatPrice';
import { slugify } from '../../../utils/slugify';
import ImageCarousel from '../../../components/ImageCarousel/ImageCarousel';
import ProductCard from '../../../components/ProductCard/ProductCard';
import '../../../styles/ProductDetail.css';

const ProductDetailClient = ({ product, relatedProducts, whatsappNumber, productImages = [] }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();
    const router = useRouter();

    // Derive "added to cart" state from actual cart contents
    const cartItem = cartItems.find(item => item.ID === product.ID);
    const isInCart = !!cartItem;
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="product-detail-page">
            
            <div className="container">

                <div className="back-to-products">
                    <Link href="/products" className="back-link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="M12 19l-7-7 7-7"></path>
                        </svg>
                        Back to Products
                    </Link>
                </div>

                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <div className="product-image-container">
                            <div className="product-image-glow"></div>
                            <ImageCarousel images={productImages} productName={product.Name} />
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
                                {!isInCart ? (
                                    <button
                                        className="add-to-cart-btn primary-action"
                                        onClick={() => addToCart(product, 1)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                        Add to Cart
                                    </button>
                                ) : (
                                    <>
                                        <div className="quantity-controller">
                                            <button onClick={() => updateQuantity(product.ID, -1)}>−</button>
                                            <span>{cartQuantity}</span>
                                            <button onClick={() => updateQuantity(product.ID, 1)}>+</button>
                                        </div>
                                        <button
                                            className="go-to-cart-btn"
                                            onClick={() => router.push('/cart')}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                            Go to Cart
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="product-note-card">
                            <div className="note-icon">!</div>
                            <div className="note-content">
                                <p>
                                    <strong>Handcrafted Item:</strong> Shipped within 3-5 business days.
                                    For inquiries, visit our <Link href="/contact">Contact</Link> page.
                                </p>
                                {product.Category?.toLowerCase().includes('combo') && (
                                    <p style={{ marginTop: '8px' }}>
                                        <strong>Note:</strong> Books featured in the product images are for styling purposes only and are not included in this combo.
                                    </p>
                                )}
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
