import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
    const {
        cartItems,
        isDrawerOpen,
        toggleDrawer,
        updateQuantity,
        removeFromCart,
        getCartTotal,
        addToCart,
        formatPrice,
        handleCheckout
    } = useCart();

    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isDrawerOpen]);

    const freeDeliveryThreshold = 1000;
    const currentTotal = getCartTotal();
    const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - currentTotal);

    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay ${isDrawerOpen ? 'active' : ''}`}
                onClick={toggleDrawer}
            />

            {/* Drawer */}
            <div className={`cart-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="close-btn" onClick={toggleDrawer}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="cart-content">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <p>Your cart is empty</p>
                            <button className="start-shopping-btn" onClick={toggleDrawer}>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div key={item.ID} className="cart-item">
                                    <div className="item-image">
                                        <img src={item.ImageURL} alt={item.Name} />
                                    </div>
                                    <div className="item-details">
                                        <div className="item-header">
                                            <h3>{item.Name}</h3>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.ID)}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="item-price-single">{formatPrice(item.Price)}</p>
                                        <div className="item-footer">
                                            <div className="qty-selector">
                                                <button onClick={() => updateQuantity(item.ID, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.ID, 1)}>+</button>
                                            </div>
                                            <span className="item-total-price">
                                                {formatPrice(item.Price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="view-full-cart">
                                <Link to="/cart" onClick={toggleDrawer}>View Full Bag &rarr;</Link>
                            </div>

                            {/* Upsell Suggestion */}
                            {!cartItems.some(item => item.ID === 'UPS-99') && (
                                <div className="cart-upsell">
                                    <div className="upsell-badge">Limited Offer</div>
                                    <p>Add a mystery <strong>WhoAmI Keychain</strong> for just ₹99!</p>
                                    <button
                                        className="add-upsell-btn"
                                        onClick={() => addToCart({
                                            ID: 'UPS-99',
                                            Name: 'Mystery Keychain Bundle',
                                            Price: 99,
                                            Material: 'PLA/Resin',
                                            ImageURL: '/products/placeholder.webp' // Assuming a mystery image exists
                                        })}
                                    >
                                        + Add to order
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        {/* Free Delivery Bar */}
                        <div className="delivery-indicator">
                            {remainingForFreeDelivery > 0 ? (
                                <p>Add <span>{formatPrice(remainingForFreeDelivery)}</span> more for <strong>FREE Delivery</strong></p>
                            ) : (
                                <p className="free-unlocked">✨ You've unlocked <strong>FREE Delivery!</strong></p>
                            )}
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(100, (currentTotal / freeDeliveryThreshold) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(currentTotal)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Estimated</span>
                                <span>{formatPrice(currentTotal)}</span>
                            </div>
                        </div>

                        <button className="checkout-btn" onClick={handleCheckout}>
                            Proceed to WhatsApp Checkout
                        </button>
                        <p className="checkout-note">Order will be finalized over WhatsApp</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
