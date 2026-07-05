'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import LoaderIntro from '../components/LoaderIntro/LoaderIntro';

export function ClientProviders({ children }) {
  const pathname = usePathname();
  const [showSite, setShowSite] = useState(pathname ? pathname !== '/' : false);

  return (
    <CartProvider>
      {!showSite && (
        <LoaderIntro onComplete={() => setShowSite(true)} />
      )}
      <div style={{ display: showSite ? 'block' : 'none' }}>
        {children}
      </div>
    </CartProvider>
  );
}
