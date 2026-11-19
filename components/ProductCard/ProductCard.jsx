'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { slugify } from '../../utils/slugify';
import './ProductCard.css';

const ProductCard = ({ product, compact = false, isCombo = false }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const FALLBACK_IMAGE = 'https://placehold.co/400x400';

    const isChotaPandit = product.Name?.toLowerCase().includes('chota pandit');
    const idNum = Number(product.ID || product.internal_id);
    const nameLower = (product.Name || '').toLowerCase();
    const folderLower = (product.FolderURL || product.ImageURL || product.image_url || '').toLowerCase();

    const isFlowerKeychain = (
        idNum === 54 ||
        nameLower.includes('flower keychain') ||
        folderLower.includes('flower-kc')
    );

    const isHeartBmPlain = (
        idNum === 55 ||
        (nameLower.includes('heart bookmark') && nameLower.includes('plain')) ||
        folderLower.includes('heart-bm/plain')
    );

    const isHeartBmDesigner = (
        idNum === 56 ||
        (nameLower.includes('heart bookmark') && (nameLower.includes('designer') || nameLower.includes('painted'))) ||
        folderLower.includes('heart-bm/painted')
    );

    const isCharmColorProduct = (
        [50, 51, 52, 53].includes(idNum) ||
        nameLower.includes('flexi dragon') ||
        (nameLower.includes('crab') && nameLower.includes('charm')) ||
        (nameLower.includes('dragon') && nameLower.includes('charm') && !nameLower.includes('egg')) ||
        nameLower.includes('balloon dog')
    );

    const isColorProduct = isFlowerKeychain || isCharmColorProduct || isHeartBmPlain;

    const defaultId = isChotaPandit 
        ? `${product.ID}-no-tray` 
        : (isHeartBmDesigner 
            ? `${product.ID}-mandala-black` 
            : (isColorProduct ? `${product.ID}-red` : product.ID));

    // Check if this product or its variants are in the cart
    const cartItem = cartItems.find(item => 
        item.ID === product.ID || 
        item.ID === defaultId || 
        (typeof item.ID === 'string' && item.ID.startsWith(`${product.ID}-`))
    );
    const quantity = cartItem ? cartItem.quantity : 0;
    const activeCartId = cartItem ? cartItem.ID : defaultId;

    // Placeholder image if none provided
    const imageUrl = product.ImageURL || FALLBACK_IMAGE;

    const isOutOfStock = product.Stock === 0 || product.stock === 0;

    // Determine tag (prioritize Out of Stock if stock is 0)
    const tag = isOutOfStock ? 'Out of Stock' : product.Tag;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        if (isChotaPandit) {
            addToCart({
                ...product,
                ID: defaultId,
                Name: `${product.Name} (Without Tray)`,
                Price: 499,
                OriginalPrice: null,
                Variant: 'Without Tray'
            });
        } else if (isHeartBmDesigner) {
            addToCart({
                ...product,
                ID: defaultId,
                Name: `${product.Name} (Mandala / Black)`,
                Price: product.Price,
                OriginalPrice: product.OriginalPrice,
                ImageURL: '/products/heart-bm/painted/1.webp',
                Variant: 'Mandala / Black'
            });
        } else if (isColorProduct) {
            addToCart({
                ...product,
                ID: defaultId,
                Name: `${product.Name} (Red)`,
                Price: product.Price,
                OriginalPrice: product.OriginalPrice,
                ImageURL: isFlowerKeychain ? '/products/flower-kc/flower-red.webp' : (product.ImageURL || null),
                Variant: 'Red'
            });
        } else {
            addToCart(product);
        }
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(activeCartId, 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity <= 1) {
            removeFromCart(activeCartId);
        } else {
            updateQuantity(activeCartId, -1);
        }
    };

    return (
        <Link href={`/products/${slugify(product.Name)}`} className={`product-card ${compact ? 'compact' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {tag && (
                <div className={`product-card-tag ${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                    {tag}
                </div>
            )}
            <div className="product-card-image">
                <Image
                    src={imageUrl}
                    alt={`${product.Name} - ${product.Category || 'Identity Artifact'}`}
                    width={400}
                    height={400}
                    loading="lazy"
                    style={{ objectFit: 'cover' }}
                />
            </div>

            <div className="product-card-content">
                <div className="product-card-header">
                    <h3 className="product-card-title">{product.Name}</h3>
                </div>

                {!compact && (
                    <>
                        <p className="product-card-description">
                            {(product.Description || '').length > 80
                                ? `${product.Description.substring(0, 80)}...`
                                : product.Description || ''}
                        </p>
                        {isCombo && (
                            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                                * Note: Books featured in images are for styling only and are not included.
                            </p>
                        )}
                        {isHeartBmDesigner && (
                            <div className="product-card-color-preview">
                                <span className="mini-color-dots">
                                    <span style={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.4)' }} title="Black" />
                                    <span style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)' }} title="White" />
                                    <span style={{ backgroundColor: '#FACC15' }} title="Yellow" />
                                </span>
                                <span className="mini-color-text">4 Designs • 3 Colors</span>
                            </div>
                        )}
                        {isColorProduct && (
                            <div className="product-card-color-preview">
                                <span className="mini-color-dots">
                                    {isHeartBmPlain ? (
                                        <>
                                            <span style={{ backgroundColor: '#EF4444' }} title="Red" />
                                            <span style={{ backgroundColor: '#3B82F6' }} title="Blue" />
                                            <span style={{ backgroundColor: '#FACC15' }} title="Yellow" />
                                            <span style={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.4)' }} title="Black" />
                                        </>
                                    ) : isFlowerKeychain ? (
                                        <>
                                            <span style={{ backgroundColor: '#EF4444' }} title="Red" />
                                            <span style={{ backgroundColor: '#3B82F6' }} title="Blue" />
                                            <span style={{ backgroundColor: '#10B981' }} title="Green" />
                                            <span style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)' }} title="White" />
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ backgroundColor: '#EF4444' }} title="Red" />
                                            <span style={{ backgroundColor: '#3B82F6' }} title="Blue" />
                                            <span style={{ backgroundColor: '#10B981' }} title="Green" />
                                            <span style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)' }} title="White" />
                                            <span style={{ backgroundColor: '#FACC15' }} title="Yellow" />
                                            <span style={{ backgroundColor: '#FFAB91' }} title="Peach" />
                                        </>
                                    )}
                                </span>
                                <span className="mini-color-text">
                                    {(isFlowerKeychain || isHeartBmPlain) ? '4 Colors' : '6 Colors'}
                                </span>
                            </div>
                        )}
                    </>
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

                        {!isOutOfStock && (
                            quantity > 0 ? (
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
                            )
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
