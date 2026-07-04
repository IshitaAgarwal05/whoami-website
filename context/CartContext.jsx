'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';
import { formatPrice } from '../utils/formatPrice';
import Toast from '../components/Toast/Toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [appliedPromo, setAppliedPromo] = useState(null);

    // Initial load from localStorage
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('whoami_cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (e) {
            console.warn('Failed to parse cart from localStorage:', e);
        }
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        if (cartItems.length > 0 || localStorage.getItem('whoami_cart')) {
            localStorage.setItem('whoami_cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // formatPrice is now imported from src/utils/formatPrice.js

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.ID === product.ID);
            if (existingItem) {
                return prevItems.map(item =>
                    item.ID === product.ID
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
        showToast(`${product.Name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        const itemToRemove = cartItems.find(item => item.ID === productId);
        setCartItems(prevItems => prevItems.filter(item => item.ID !== productId));
        if (itemToRemove) {
            showToast(`${itemToRemove.Name} removed`, 'info');
        }
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(prevItems => {
            const updated = prevItems.map(item => {
                if (item.ID === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return null;
                    return { ...item, quantity: newQty };
                }
                return item;
            }).filter(Boolean);

            // Show toast for removed items (handled inline, no competing setState)
            const removedItem = prevItems.find(item => item.ID === productId);
            if (removedItem && !updated.find(item => item.ID === productId)) {
                setTimeout(() => showToast(`${removedItem.Name} removed`, 'info'), 0);
            }
            return updated;
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.Price * item.quantity), 0);
    };

    const VALID_PROMO_CODES = ['KAY20', 'NEW10', 'WHO15', 'RAI20'];

    const applyPromoCode = (code) => {
        const upperCode = code.trim().toUpperCase();
        
        // Check if code is in the valid list
        if (!VALID_PROMO_CODES.includes(upperCode)) {
            return { success: false, message: 'Invalid or expired promo code.' };
        }

        // Validate code format: exactly 3 letters followed by exactly 2 digits
        const regex = /^[A-Z]{3}(\d{2})$/;
        const match = upperCode.match(regex);
        
        if (!match) {
            return { success: false, message: 'Invalid promo code format.' };
        }
        
        const discountPercentage = parseInt(match[1], 10);
        
        setAppliedPromo({
            code: code.trim().toUpperCase(),
            discountPercentage
        });
        showToast(`Promo code ${code.trim().toUpperCase()} applied!`);
        return { success: true, message: `Applied ${discountPercentage}% discount!` };
    };

    const removePromoCode = () => {
        setAppliedPromo(null);
        showToast('Promo code removed', 'info');
    };

    const getDiscountAmount = () => {
        if (!appliedPromo) return 0;
        
        if (appliedPromo.code === 'RAI20') {
            const RAI20_ELIGIBLE_IDS = ['2', '3', '4', '5', '6', '7', '8', '9', '11', '13', '17', '18', '21', '31', '32', '34'];
            const applicableTotal = cartItems.reduce((total, item) => {
                const isApplicable = RAI20_ELIGIBLE_IDS.includes(String(item.ID));
                if (isApplicable) {
                    return total + (item.Price * item.quantity);
                }
                return total;
            }, 0);
            return applicableTotal * (appliedPromo.discountPercentage / 100);
        }

        return getCartTotal() * (appliedPromo.discountPercentage / 100);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;

        let message = "Hi, I want to order:\n\n";
        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.Name} – ${formatPrice(item.Price)} x ${item.quantity}\n`;
        });

        const total = getCartTotal();
        let finalTotal = total;
        
        message += `\nSubtotal: ${formatPrice(total)}`;
        
        if (appliedPromo) {
            const discountAmount = getDiscountAmount();
            finalTotal = total - discountAmount;
            message += `\nPromo Code Applied: ${appliedPromo.code} (-${appliedPromo.discountPercentage}%)`;
            message += `\nDiscount: -${formatPrice(discountAmount)}`;
        }

        message += `\nFinal Total: ${formatPrice(finalTotal)}`;
        message += `\n\nName:\nCity:`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    const getItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const value = {
        cartItems,
        isDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        toggleDrawer,
        setIsDrawerOpen,
        formatPrice,
        handleCheckout,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        getDiscountAmount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onComplete={() => setToast(null)}
                />
            )}
        </CartContext.Provider>
    );
};
