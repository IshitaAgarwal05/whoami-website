import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../config';
import Hero from '../../components/Hero/Hero';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import TestimonialCarousel from '../../components/TestimonialCarousel/TestimonialCarousel';
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

            {/* Testimonials Section */}
            <section className="section testimonials-section">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Community</span>
                        <h2>Identity in Every Story</h2>
                        <p className="section-description">
                            How WhoAmI artifacts find their home on desks and in lives across the country.
                        </p>
                    </div>

                    <TestimonialCarousel
                        testimonials={[
                            {
                                text: "I ordered a desk piece from WhoAmI and honestly, it doesn’t feel like a typical 3D printed object. It feels like something designed with thought. It’s subtle, aesthetic, and people actually ask me about it when they see my desk.",
                                author: "Aayush",
                                role: "Architecture Student"
                            },
                            {
                                text: "I bought this as a gift for a friend who is a huge Harry Potter fan, and the reaction was priceless. It didn’t look mass-produced at all. It felt personal and unique. That’s very rare to find these days.",
                                author: "Riya",
                                role: "MBA Student"
                            },
                            {
                                text: "Most desk decor items online look very generic, but WhoAmI pieces are different. They feel like identity pieces rather than just decor. It’s a small thing, but it changes how my desk feels.",
                                author: "Kunal",
                                role: "Software Engineer"
                            },
                            {
                                text: "The finish, the weight, the detailing — everything was much better than what I expected from a student startup. If this is their starting quality, I’m excited to see what they build next.",
                                author: "Mehul",
                                role: "Product Designer"
                            },
                            {
                                text: "What I liked the most is the idea behind the brand — that the things on your desk represent you. That thought stayed with me, and that’s why I bought it. The product just made that idea real.",
                                author: "Sneha",
                                role: "Psychology Student"
                            }
                        ]}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;