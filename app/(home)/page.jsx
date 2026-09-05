import Hero from '../../components/Hero/Hero';
import Link from 'next/link';
import GalleryCarousel from '../../components/GalleryCarousel/GalleryCarousel';
import ReviewCarousel from '../../components/ReviewCarousel/ReviewCarousel';
import TestimonialCarousel from '../../components/TestimonialCarousel/TestimonialCarousel';
import FaqFolders from '../../components/FaqFolders/FaqFolders';
import InteractiveCTA from '../../components/InteractiveCTA/InteractiveCTA';
import config from '../../config';
import '../../styles/Home.css';

import fs from 'fs';
import path from 'path';

async function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), 'public', 'gallery');
  try {
    const files = fs.readdirSync(galleryDir);
    const images = files
      .filter(f => f.endsWith('.webp'))
      .map(f => `/gallery/${f}`);
    return images;
  } catch (error) {
    console.error('Error reading gallery directory:', error);
    return [];
  }
}

async function getReviewImages() {
  const reviewsDir = path.join(process.cwd(), 'public', 'reviews');
  try {
    if (!fs.existsSync(reviewsDir)) return [];
    const files = fs.readdirSync(reviewsDir);
    const images = files
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => `/reviews/${f}`);
    return images;
  } catch (error) {
    console.error('Error reading reviews directory:', error);
    return [];
  }
}

async function getCustomOrderImages() {
  const customDir = path.join(process.cwd(), 'public', 'custom_orders');
  try {
    if (!fs.existsSync(customDir)) return [];
    const files = fs.readdirSync(customDir);
    const images = files
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => `/custom_orders/${f}`);
    return images;
  } catch (error) {
    console.error('Error reading custom_orders directory:', error);
    return [];
  }
}

export const generateMetadata = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const description = 'Premium handcrafted identity artifacts from Jaipur. We distill the essence of your favorite fandoms into geometric desk decor.';

  return {
    title: 'WhoAmI | Identity, crafted.',
    description: description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: 'WhoAmI | Identity Artifacts',
      description: description,
      url: siteUrl,
      siteName: 'WhoAmI',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`, // User should provide this, or I can generate a placeholder
          width: 1200,
          height: 630,
          alt: 'WhoAmI - Identity, crafted.',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'WhoAmI | Identity, crafted.',
      description: description,
      images: [`${siteUrl}/og-image.png`],
    },
  };
};

async function getProducts() {
  const baseUrl = config.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching product data for quiz:', error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const galleryImages = await getGalleryImages();
  const reviewImages = await getReviewImages();
  const customOrderImages = await getCustomOrderImages();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WhoAmI',
    url: siteUrl,
    description: 'Handcrafted identity artifacts for the quietly expressive.',
    publisher: {
      '@type': 'Organization',
      name: 'WhoAmI',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/whoami_logo.png`,
      },
    },
  };

  const testimonials = [
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
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <div className="home-page">
        <Hero />

        {/* Worlds Section */}
        <section className="section fandoms-showcase">
          <div className="container">
            <div className="section-header-centered">
              <span className="section-label">Fandoms</span>
              <h2>Translate Your World</h2>
              <p className="section-description">
                3D Printed Artifacts for the quietly expressive. We distill the essence of your favorite universes into geometric forms that resonate on your desk.
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

        {/* Desk Alignment Personality Quiz */}
        <InteractiveCTA products={products} />

        {/* Gallery Section */}
        <section className="section gallery-section">
          <div className="container">
            <GalleryCarousel
              categoryName="Gallery"
              images={galleryImages}
            />
          </div>
        </section>

        {/* Custom Orders Section */}
        {customOrderImages.length > 0 && (
          <section className="section custom-orders-section">
            <div className="container">
              <div className="section-header-centered">
                <span className="section-label">Made For You</span>
                <h2>Curated, Just for You</h2>
                <p className="section-description">
                  Every desk tells a story. We craft personalized 3D artifacts — name plates, custom logos, unique desk pieces — tailored to <em>your</em> identity. No templates, no limits.
                </p>
              </div>
            </div>

            {/* Infinite Marquee Strip */}
            <div className="custom-orders-marquee-wrapper" aria-hidden="true">
              <div className="custom-orders-marquee-track">
                {[...customOrderImages, ...customOrderImages].map((src, i) => (
                  <div key={i} className="custom-orders-marquee-item">
                    <img src={src} alt="Custom order" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            <div className="custom-orders-cta">
              <p className="custom-orders-cta-text">Have something specific in mind?</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917891063938'}?text=Hi%2C%20I%20want%20to%20place%20a%20custom%20order!`}
                target="_blank"
                rel="noopener noreferrer"
                className="custom-orders-cta-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Request a Custom Order
              </a>
            </div>
          </section>
        )}

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

            <TestimonialCarousel testimonials={testimonials} />
            <ReviewCarousel categoryName="Reactions Unfiltered" images={reviewImages} />

            {/* Dual Careers & Blog CTAs */}
            <div className="home-ctas-container">
              <div className="home-cta-card">
                <div>
                  <span className="blog-badge" style={{ marginBottom: '12px' }}>Careers</span>
                  <h3>Want to Build the Next Universe?</h3>
                  <p style={{ marginTop: '8px' }}>We are always looking for creative developers, crochets, and 3D modeling artists to join our Jaipur studio.</p>
                </div>
                <Link href="/careers" className="home-cta-btn" style={{ marginTop: '15px' }}>
                  See Open Roles &rarr;
                </Link>
              </div>

              <div className="home-cta-card">
                <div>
                  <span className="blog-badge" style={{ marginBottom: '12px' }}>Journal</span>
                  <h3>Go Behind the Scenes</h3>
                  <p style={{ marginTop: '8px' }}>Read about our artisan casting, Jaipur workshop process, 3D printing parameters, and modern desk setups.</p>
                </div>
                <Link href="/blog" className="home-cta-btn" style={{ marginTop: '15px' }}>
                  Read Our Journal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
