import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoaderIntro from './components/LoaderIntro/LoaderIntro';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home/Home'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Blog = lazy(() => import('./pages/Blog/Blog'));

// Simple loading fallback
const PageLoader = () => (
  <div className="loading-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading"></div>
  </div>
);

function App() {
  const isHomePage = window.location.pathname === '/';
  const [showIntro, setShowIntro] = useState(isHomePage);
  const [showSite, setShowSite] = useState(!isHomePage);

  return (
    <>
      {showIntro && (
        <LoaderIntro
          onRevealStart={() => setShowSite(true)}
          onComplete={() => setShowIntro(false)}
        />
      )}
      {showSite && (
        <Router>
          <ScrollToTop />
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      )}
    </>
  );
}

export default App;