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
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('whoami_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.warn('Failed to parse cart from localStorage:', e);
            return [];
        }
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        localStorage.setItem('whoami_cart', JSON.stringify(cartItems));
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
        handleCheckout
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
