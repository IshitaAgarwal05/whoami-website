import './Blog.css';

const Blog = () => {
    const blogPosts = [
        {
            title: "The Art of Identity Artifacts",
            date: "February 2026",
            excerpt: "Why we create symbols instead of merchandise. Exploring the difference between wearing what you love and expressing who you are.",
            content: "Coming soon..."
        },
        {
            title: "Behind the Craft: 3D Printing in Jaipur",
            date: "January 2026",
            excerpt: "A look at our design process, from concept sketches to finished products. How technology meets tradition in our studio.",
            content: "Coming soon..."
        },
        {
            title: "Why Subtle Matters",
            date: "December 2025",
            excerpt: "In a world of loud branding, we explore the power of quiet expression. For those who know the difference between a symbol and a logo.",
            content: "Coming soon..."
        }
    ];

    return (
        <div className="blog-page">
            <div className="container">
                {/* Header */}
                <div className="blog-header">
                    <h1>Journal</h1>
                    <p className="blog-subtitle">
                        Stories, insights, and reflections on identity, craft, and the universes we belong to.
                    </p>
                </div>

                {/* Blog Posts */}
                <div className="blog-grid">
                    {blogPosts.map((post, index) => (
                        <article key={index} className="blog-card">
                            <div className="blog-card-header">
                                <span className="blog-date">{post.date}</span>
                            </div>
                            <h2 className="blog-title">{post.title}</h2>
                            <p className="blog-excerpt">{post.excerpt}</p>
                            <div className="blog-status">
                                <span className="status-badge">Coming Soon</span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Coming Soon Message */}
                <div className="blog-cta">
                    <h2>More stories on the way</h2>
                    <p>
                        Follow us on{' '}
                        <a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer">
                            Instagram @whoami.studios
                        </a>
                        {' '}for updates, behind-the-scenes content, and product releases.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Blog;
