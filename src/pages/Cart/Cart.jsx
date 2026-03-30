import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import config from '../../config';
import './Cart.css';

const Cart = () => {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        clearCart,
        addToCart
    } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        let message = "Hi, I want to order:\n\n";
        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.Name} – ${formatPrice(item.Price)} x ${item.quantity}\n`;
        });

        const total = getCartTotal();
        message += `\nTotal: ${formatPrice(total)}`;
        message += `\n\nName:\nCity:`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    const freeDeliveryThreshold = 1000;
    const currentTotal = getCartTotal();
    const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - currentTotal);

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart-page">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h1>Your cart feels lonely</h1>
                        <p>Discover products that match your identity and add them here.</p>
                        <Link to="/products" className="shop-now-btn">Explore Collection</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-page-header">
                    <h1>Shopping Bag</h1>
                    <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag</p>
                </div>

                <div className="cart-page-grid">
                    <div className="cart-items-section">
                        <div className="cart-table-header">
                            <span>Product</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>
                        {cartItems.map((item) => (
                            <div key={item.ID} className="cart-page-item">
                                <div className="item-main">
                                    <div className="item-img">
                                        <img src={item.ImageURL} alt={item.Name} />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.Name}</h3>
                                        <p>{item.Material}</p>
                                        <span className="price-tag">{formatPrice(item.Price)}</span>
                                        <button
                                            className="item-remove-link"
                                            onClick={() => removeFromCart(item.ID)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="item-qty">
                                    <div className="qty-box">
                                        <button onClick={() => updateQuantity(item.ID, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.ID, 1)}>+</button>
                                    </div>
                                </div>
                                <div className="item-total">
                                    {formatPrice(item.Price * item.quantity)}
                                </div>
                            </div>
                        ))}

                        <div className="cart-page-actions">
                            <Link to="/products" className="continue-link">&larr; Continue Shopping</Link>
                            <button className="clear-cart-link" onClick={clearCart}>Clear Cart</button>
                        </div>
                    </div>

                    <div className="cart-summary-section">
                        <div className="glass-card summary-card">
                            <h2>Order Summary</h2>

                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(currentTotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className={remainingForFreeDelivery === 0 ? 'free-text' : ''}>
                                        {remainingForFreeDelivery === 0 ? 'FREE' : 'Calculated at checkout'}
                                    </span>
                                </div>

                                {remainingForFreeDelivery > 0 && (
                                    <div className="shipping-promo">
                                        <p>Add <strong>{formatPrice(remainingForFreeDelivery)}</strong> more to get <strong>FREE Shipping</strong></p>
                                        <div className="promo-progress">
                                            <div
                                                className="promo-fill"
                                                style={{ width: `${Math.min(100, (currentTotal / freeDeliveryThreshold) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="summary-total">
                                <div className="summary-row final">
                                    <span>Total</span>
                                    <span>{formatPrice(currentTotal)}</span>
                                </div>
                                <p className="tax-inclusive">Inclusive of all taxes</p>
                            </div>

                            {/* Cart Page Upsell */}
                            {!cartItems.some(item => item.ID === 'UPS-99') && (
                                <div className="cart-page-upsell">
                                    <div className="upsell-badge">Limited Offer</div>
                                    <p>Add a mystery <strong>WhoAmI Keychain</strong> for just ₹99!</p>
                                    <button
                                        className="add-upsell-btn"
                                        onClick={() => addToCart({
                                            ID: 'UPS-99',
                                            Name: 'Mystery Keychain Bundle',
                                            Price: 99,
                                            Material: 'PLA/Resin',
                                            ImageURL: '/products/placeholder.webp'
                                        })}
                                    >
                                        + Add to Bag
                                    </button>
                                </div>
                            )}

                            <button className="page-checkout-btn" onClick={handleCheckout}>
                                Checkout via WhatsApp
                            </button>

                            <div className="trust-badges">
                                <div className="badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    Secure Ordering
                                </div>
                                <div className="badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 8v4l3 3"></path>
                                    </svg>
                                    Fast Delivery
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
