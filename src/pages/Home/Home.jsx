import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import Hero from '../../components/Hero/Hero';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import FaqFolders from '../../components/FaqFolders/FaqFolders';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/products'));
                if (response.data.success) {
                    // Limit to 6 products for home page preview
                    setProducts(response.data.data.slice(0, 6));
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="home-page">
            <Hero />

            {/* Worlds Section */}
            <section className="section fandoms-showcase">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Fandoms</span>
                        <h2>Translate Your World</h2>
                        <p className="section-description">
                            Artifacts for the quietly expressive. We distill the essence of your favorite universes into geometric forms that resonate on your desk.
                        </p>
                    </div>

                    <div className="fandom-staggered-grid">
                        <div className="fandom-card-premium">
                            <span className="fandom-card-icon">⚡</span>
                            <div className="fandom-card-content">
                                <h3>The Wizarding World</h3>
                                <p>Ancient symbols, modern craft.</p>
                            </div>
                            <div className="card-glow"></div>
                        </div>
                        <div className="fandom-card-premium">
                            <span className="fandom-card-icon">🛡️</span>
                            <div className="fandom-card-content">
                                <h3>Superhero Universes</h3>
                                <p>Icons of resilience and power.</p>
                            </div>
                            <div className="card-glow"></div>
                        </div>
                        <div className="fandom-card-premium">
                            <span className="fandom-card-icon">🚀</span>
                            <div className="fandom-card-content">
                                <h3>Galactic Sagas</h3>
                                <p>Artifacts from a galaxy far away.</p>
                            </div>
                            <div className="card-glow"></div>
                        </div>
                        <div className="fandom-card-premium">
                            <span className="fandom-card-icon">⚔️</span>
                            <div className="fandom-card-content">
                                <h3>Gaming Realms</h3>
                                <p>Mythology in the palm of your hand.</p>
                            </div>
                            <div className="card-glow"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="section featured-section">
                <div className="container">

                    {loading ? (
                        <div className="loading-state">
                            <div className="loading"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <ProductCarousel
                            categoryName="Featured Artifacts"
                            products={products}
                        />
                    )}
                </div>
            </section>

            {/* Values Section */}
            <section className="section values-section">
                <div className="container">
                    <h2 className="text-center">Why Choose WhoAmI</h2>

                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">✦</div>
                            <h3>Identity</h3>
                            <p>
                                Not what you wear. Who you are. Artifacts that resonate with those
                                who understand the difference between a symbol and a logo.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">⚡</div>
                            <h3>Rebellion</h3>
                            <p>
                                Quiet. Confident. Refusing to conform to beige aesthetics and
                                generic workspaces. Premium craft for the quietly extraordinary.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">🇮🇳</div>
                            <h3>Indian Craft</h3>
                            <p>
                                Designed and crafted in India. Supporting local manufacturing,
                                creating artifacts worthy of your identity.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">◈</div>
                            <h3>Connection</h3>
                            <p>
                                From our Jaipur workshops to desks across India and beyond.
                                Globally understood, locally crafted.
                            </p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon">🎁</div>
                            <h3>Perfect Gifts</h3>
                            <p>
                                Know some fantasy person? Our products make meaningful gifts they'll treasure forever.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Folders Section */}
            <FaqFolders />
        </div>
    );
};

export default Home;
