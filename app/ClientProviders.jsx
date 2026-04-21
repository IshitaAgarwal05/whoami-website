'use client';

import { CartProvider } from '../src/context/CartContext';

export function ClientProviders({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
