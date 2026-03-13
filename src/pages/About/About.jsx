import ValuesCarousel from '../../components/ValuesCarousel/ValuesCarousel';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <div className="container">
                {/* Hero Section */}
                <div className="about-hero">
                    <h1>About WhoAmI</h1>
                    <p className="about-tagline">Where identity meets craft. Where rebellion is subtle.</p>
                </div>

                {/* Story Section */}
                <section className="about-section">
                    <h2>Our Story</h2>

                    <div className="about-content">
                        <p>
                        WHOAMI started with a simple question: <strong>Who are you, really?</strong>
                        </p>

                        <p>
                        In a world full of trends, noise, and mass-produced merchandise, we felt
                        something was missing — objects that actually mean something. Not just
                        decor. Not just fandom merch. But artifacts that represent identity,
                        imagination, and the stories we connect with.
                        </p>

                        <p>
                        We are a student-led startup built on curiosity, creativity, and the
                        belief that the things we keep around us should reflect who we are
                        becoming.
                        </p>

                        <p>
                        At WHOAMI, we create limited-edition 3D-printed desk artifacts and
                        collectible pieces inspired by culture, fandom, and symbolism. Every
                        piece is designed to be more than just an object — it's a conversation
                        starter, a personal symbol, and a reminder of the worlds and ideas that
                        shape us.
                        </p>

                        <p>
                        We're starting small, experimenting, building in public, and learning as
                        we go. But our vision is simple:
                        </p>

                        <p>
                        <strong>
                            To build a brand where identity, creativity, and collectibles meet.
                        </strong>
                        </p>
                    </div>
                </section>

                {/* Worlds Section */}
                <section className="about-section fandoms-section">
                    <h2>Worlds We Translate</h2>
                    <div className="fandoms-grid">
                        <div className="fandom-badge">The Wizarding World</div>
                        <div className="fandom-badge">Superhero Universes</div>
                        <div className="fandom-badge">Galactic Sagas</div>
                        <div className="fandom-badge">Comics</div>
                        <div className="fandom-badge">Mythologies</div>
                        <div className="fandom-badge">Gaming Realms</div>
                        <div className="fandom-badge">Fantasy Epics</div>
                        <div className="fandom-badge">Your Universe</div>
                        {/* <div className="fandom-badge">Custom Requests</div> */}
                    </div>
                </section>

                {/* Values Section - Carousel */}
                <ValuesCarousel />

                {/* Audience Section */}
                <section className="about-section">
                    <h2>Who We Create For</h2>
                    <div className="audience-grid">
                        <div className="audience-card">
                            <h3>Students & Creators</h3>
                            <p>
                                Your dorm room, your studio, your late-night coding setup —
                                spaces that deserve artifacts of who you're becoming.
                                Budget-friendly identity pieces that don't apologize for passion.
                            </p>
                        </div>
                        <div className="audience-card">
                            <h3>Young Professionals</h3>
                            <p>
                                Your workspace doesn't have to scream to speak volumes.
                                Subtle symbols that say "I refuse to be ordinary" to those who understand.
                                Professional on the surface, extraordinary beneath.
                            </p>
                        </div>
                        <div className="audience-card">
                            <h3>Gift Seekers</h3>
                            <p>
                                For the person who doesn't need more stuff, they need
                                validation that someone sees who they really are.
                                Artifacts that say "I get you" without explanation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="about-section process-section">
                    <h2>How We Work</h2>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">01</div>
                            <h3>Design</h3>
                            <p>
                                Universes translated into tangible form. Research, iteration,
                                refinement, until we create something worthy of your identity.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">02</div>
                            <h3>Craft</h3>
                            <p>
                                Made using 3D printing technology.
                                Premium materials ensure durability fit for everyone.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">03</div>
                            <h3>Quality Check</h3>
                            <p>
                                Every piece inspected by those who understand what these symbols mean.
                                Not good enough for us? Not good enough for you.
                            </p>
                        </div>
                        <div className="process-step">
                            <div className="step-number">04</div>
                            <h3>Deliver</h3>
                            <p>
                                Shipped across India with care. Your artifact arrives ready
                                to prove your identity to the world.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Made in India */}
                <section className="about-section india-section">
                    <div className="india-banner">
                        <span className="india-flag">🇮🇳</span>
                        <h3>Proudly Made in India</h3>
                        <p>
                            Designed, crafted, and shipped from Jaipur. Indian creativity meets global
                            standards, creating identity artifacts for the quietly expressive wherever they are.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
