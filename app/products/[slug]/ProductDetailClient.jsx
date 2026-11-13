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

const getProductVariants = (product) => {
    const isChotaPandit = product?.Name?.toLowerCase().includes('chota pandit') || product?.ID === 48 || product?.ID === '48';
    
    if (isChotaPandit) {
        return [
            {
                id: `${product.ID}-with-tray`,
                name: 'With Ash Catcher Tray',
                fullName: `${product.Name} (With Free Ash Catcher Tray)`,
                price: 499,
                originalPrice: 699,
                badge: 'Diwali Offer • Free Tray! 🪔',
                description: 'Complete Set: Chota Pandit Figurine + Custom Ash Catcher Tray (₹200 value included FREE)'
            },
            {
                id: `${product.ID}-no-tray`,
                name: 'Figurine Only (Without Tray)',
                fullName: `${product.Name} (Without Tray)`,
                price: 499,
                originalPrice: null,
                badge: null,
                description: 'Solo Collectible: Chota Pandit Agarbatti Figurine Only'
            }
        ];
    }
    return null;
};

const ProductDetailClient = ({ product, relatedProducts, whatsappNumber, productImages = [] }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();
    const router = useRouter();

    const variants = getProductVariants(product);
    const [selectedVariant, setSelectedVariant] = useState(variants ? variants[0] : null);

    const isDiwaliProduct = product?.Name?.toLowerCase().includes('chota pandit') || 
        product?.Tag?.toLowerCase().includes('diwali') || 
        (product?.Tags && product.Tags.some(t => t.toLowerCase().includes('diwali')));

    const isOutOfStock = product?.Stock === 0 || product?.stock === 0;

    const activeId = selectedVariant ? selectedVariant.id : product.ID;
    const activeName = selectedVariant ? selectedVariant.fullName : product.Name;
    const activePrice = selectedVariant ? selectedVariant.price : product.Price;
    const activeOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.OriginalPrice;

    // Derive "added to cart" state from actual cart contents for active variant
    const cartItem = cartItems.find(item => item.ID === activeId);
    const isInCart = !!cartItem;
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
            ...product,
            ID: activeId,
            Name: activeName,
            Price: activePrice,
            OriginalPrice: activeOriginalPrice,
            Variant: selectedVariant ? selectedVariant.name : null
        }, 1);
    };

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
                        <div className={`product-image-container ${isOutOfStock ? 'out-of-stock' : ''}`}>
                            <div className="product-image-glow"></div>
                            <ImageCarousel images={productImages} productName={product.Name} />
                        </div>
                    </div>

                    <div className="product-info-section">
                        <div className="glass-card product-main-info">
                            <div className="product-badges-row">
                                <span className="product-category-badge">{product.Category}</span>
                                {isOutOfStock ? (
                                    <span className="product-category-badge out-of-stock-pill">Out of Stock</span>
                                ) : isDiwaliProduct ? (
                                    <span className="product-category-badge diwali-pill">🪔 Diwali Offer</span>
                                ) : null}
                            </div>
                            <h1 className="product-title">{product.Name}</h1>
                            <div className="product-price-tag">
                                <span className="price-label">Price</span>
                                <div className="info-price-row">
                                    <span className="price-value">{formatPrice(activePrice)}</span>
                                    {activeOriginalPrice && activeOriginalPrice > activePrice && (
                                        <>
                                            <span className="info-original-price">{formatPrice(activeOriginalPrice)}</span>
                                            <span className="info-discount-badge">
                                                {Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Diwali Special Offer Banner */}
                            {isDiwaliProduct && (
                                <div className="diwali-special-banner">
                                    <div className="diwali-banner-header">
                                        <span className="diwali-flame-icon">🪔</span>
                                        <span className="diwali-banner-badge">Diwali Festive Offer</span>
                                    </div>
                                    <p className="diwali-banner-desc">
                                        <strong>Free Ash Catcher Tray Included:</strong> The custom-textured ash catcher tray (worth ₹200) is included completely <strong>FREE</strong> with your Chota Pandit figurine this festive season! Both options are <strong>₹499</strong>.
                                    </p>
                                </div>
                            )}

                            {/* Variant Selector */}
                            {variants && variants.length > 0 && (
                                <div className="product-variant-section">
                                    <div className="variant-header">
                                        <span className="variant-label">Choose Edition:</span>
                                        <span className="variant-selected-name">{selectedVariant?.name}</span>
                                    </div>
                                    <div className="variant-cards-list">
                                        {variants.map((v) => {
                                            const isSelected = selectedVariant?.id === v.id;
                                            return (
                                                <div
                                                    key={v.id}
                                                    className={`variant-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => setSelectedVariant(v)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <div className="variant-card-radio">
                                                        <div className={`radio-dot ${isSelected ? 'active' : ''}`} />
                                                    </div>
                                                    <div className="variant-card-body">
                                                        <div className="variant-card-title-row">
                                                            <span className="variant-card-title">{v.name}</span>
                                                            {v.badge && (
                                                                <span className="variant-card-festive-tag">{v.badge}</span>
                                                            )}
                                                        </div>
                                                        <span className="variant-card-desc">{v.description}</span>
                                                    </div>
                                                    <div className="variant-card-pricing">
                                                        <span className="variant-card-price">{formatPrice(v.price)}</span>
                                                        {v.originalPrice && v.originalPrice > v.price && (
                                                            <span className="variant-card-orig-price">{formatPrice(v.originalPrice)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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

                            <div className={`product-actions ${isOutOfStock ? 'out-of-stock' : ''}`}>
                                {isOutOfStock ? (
                                    <button
                                        type="button"
                                        className="add-to-cart-btn out-of-stock-btn"
                                        disabled
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                        </svg>
                                        <span>Out of Stock</span>
                                    </button>
                                ) : !isInCart ? (
                                    <button
                                        className="add-to-cart-btn primary-action"
                                        onClick={handleAddToCart}
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
                                            <button onClick={() => updateQuantity(activeId, -1)}>−</button>
                                            <span>{cartQuantity}</span>
                                            <button onClick={() => updateQuantity(activeId, 1)}>+</button>
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
