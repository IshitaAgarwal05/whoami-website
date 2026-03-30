import React, { createContext, useContext, useState, useEffect } from 'react';
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
        const savedCart = localStorage.getItem('whoami_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        localStorage.setItem('whoami_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

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
        setCartItems(prevItems => prevItems.map(item => {
            if (item.ID === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.Price * item.quantity), 0);
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
        setIsDrawerOpen
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
