'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import LoaderIntro from '../components/LoaderIntro/LoaderIntro';

export function ClientProviders({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin-dashboard') || pathname?.startsWith('/admin');
  
  // Never show loader intro on admin routes or non-root pages
  const [showSite, setShowSite] = useState(pathname ? (pathname !== '/' || isAdminRoute) : false);

  useEffect(() => {
    if (isAdminRoute) {
      setShowSite(true);
    }
  }, [isAdminRoute]);

  return (
    <AdminAuthProvider>
      <ThemeProvider>
        <CartProvider>
          {!showSite && !isAdminRoute && (
            <LoaderIntro onComplete={() => setShowSite(true)} />
          )}
          <div style={{ display: (showSite || isAdminRoute) ? 'block' : 'none' }}>
            {children}
          </div>
        </CartProvider>
      </ThemeProvider>
    </AdminAuthProvider>
  );
}
