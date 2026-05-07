'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import LoaderIntro from '../components/LoaderIntro/LoaderIntro';

export function ClientProviders({ children }) {
  const pathname = usePathname();
  const [showSite, setShowSite] = useState(pathname ? pathname !== '/' : false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <CartProvider>
      {isMounted && !showSite && (
        <LoaderIntro onComplete={() => setShowSite(true)} />
      )}
      <div style={{ display: showSite ? 'block' : 'none' }}>
        {children}
      </div>
    </CartProvider>
  );
}
