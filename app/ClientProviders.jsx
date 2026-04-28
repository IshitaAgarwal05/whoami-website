'use client';

import { useState, useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import LoaderIntro from '../components/LoaderIntro/LoaderIntro';

export function ClientProviders({ children }) {
  const [showSite, setShowSite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <CartProvider>
      {isMounted && !showSite && (
        <LoaderIntro onComplete={() => setShowSite(true)} />
      )}
      <div style={{ display: (isMounted && !showSite) ? 'none' : 'block' }}>
        {children}
      </div>
    </CartProvider>
  );
}
