import './globals.css';
import { ClientProviders } from './ClientProviders';
import Navbar from '../src/components/Navbar/Navbar';
import Footer from '../src/components/Footer/Footer';
import CartDrawer from '../src/components/CartDrawer/CartDrawer';

export const metadata = {
  title: 'WhoAmI | Identity, crafted.',
  description: 'Artifacts for the quietly expressive. Crafted in Jaipur for those who refuse to blend in.',
  robots: 'index, follow',
  icons: {
    icon: '/whoami_logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WhoAmI',
    url: siteUrl,
    logo: `${siteUrl}/whoami_logo.png`,
    sameAs: [
      'https://instagram.com/whoami.store', // Placeholder or real
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </head>
      <body>
        <ClientProviders>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
