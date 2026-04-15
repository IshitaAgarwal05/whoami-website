import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import LoaderIntro from './components/LoaderIntro/LoaderIntro';
import FluidSimulation from './components/FluidSimulation/FluidSimulation';
import './App.css';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home/Home'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
  </div>
);

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '6rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-warm-gold)', marginBottom: '1rem' }}>404</h1>
    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>This page doesn't exist.</p>
    <a href="/" style={{ color: 'var(--color-warm-gold)', textDecoration: 'underline', fontSize: '1rem' }}>Back to Home</a>
  </div>
);

function App() {
  const [showSite, setShowSite] = useState(false);

  return (
    <CartProvider>
      {!showSite ? (
        <LoaderIntro onComplete={() => setShowSite(true)} />
      ) : (
        <Router>
          <ScrollToTop />
          <CartDrawer />
          <div className="app">
            <Navbar />
            <main className="main-content">
              <FluidSimulation />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      )}
    </CartProvider>
  );
}

export default App;