'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Blog.css';

const CATEGORIES = [
    'All',
    'Behind the Build',
    'Collectibles',
    'Desk Setup',
    '3D Printing',
    'Fandom Culture',
    'Gift Ideas'
];

export default function BlogClient({ initialPosts }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Admin publishing panel states
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isAuthed, setIsAuthed] = useState(false);
    const [adminError, setAdminError] = useState('');
    const [publishLoading, setPublishLoading] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState(null);
    const [newPostData, setNewPostData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Behind the Build',
        image: '',
        tags: ''
    });

    // 1. Filter Posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            const cleanQuery = searchQuery.toLowerCase().trim();
            const matchesSearch = !cleanQuery || 
                post.title.toLowerCase().includes(cleanQuery) ||
                post.excerpt.toLowerCase().includes(cleanQuery) ||
                (post.tags && post.tags.some(t => t.toLowerCase().includes(cleanQuery)));
            return matchesCategory && matchesSearch;
        });
    }, [posts, selectedCategory, searchQuery]);

    // 2. Identify Featured Post (first post of the filtered results, if any)
    const featuredPost = filteredPosts[0];
    
    // Remaining posts for the grid
    const gridPosts = filteredPosts.slice(1);

    const handleAuth = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            setIsAuthed(true);
            setAdminError('');
        } else {
            setAdminError('Please enter an API key');
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        setAdminError('');
        setPublishSuccess(null);

        if (!newPostData.title || !newPostData.excerpt || !newPostData.content) {
            setAdminError('Please fill out the Title, Excerpt, and Content fields.');
            return;
        }

        setPublishLoading(true);

        try {
            const response = await fetch('/api/blog/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(newPostData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to publish post');
            }

            // Success!
            setPosts(prev => [result.data, ...prev]);
            setPublishSuccess(result);
            
            // Clear form (except auth key)
            setNewPostData({
                title: '',
                excerpt: '',
                content: '',
                category: 'Behind the Build',
                image: '',
                tags: ''
            });

        } catch (err) {
            setAdminError(err.message || 'An error occurred during publishing.');
        } finally {
            setPublishLoading(false);
        }
    };

    return (
        <div className="blog-page">
            <div className="blog-bg-elements" />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div className="blog-header">
                    <span className="blog-badge">Journal</span>
                    <h1>WhoAmI Chronicles</h1>
                    <p className="blog-subtitle">
                        Deep dives into geometric sculpting, artisan casting from Jaipur, desk styling tips, and maker culture.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="filters-search-container">
                    <div className="category-tabs">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="search-box-wrapper">
                        <svg className="search-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Featured Post Card */}
                {featuredPost && (
                    <div className="featured-post-container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="featured-card"
                        >
                            <div className="featured-image-wrapper">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="featured-image"
                                />
                            </div>
                            <div className="featured-content">
                                <div className="post-meta-row">
                                    <span className="post-category-tag">{featuredPost.category}</span>
                                    <span className="post-dot"></span>
                                    <span className="post-date-tag">{featuredPost.date}</span>
                                    <span className="post-dot"></span>
                                    <span className="post-read-time">{featuredPost.readingTime}</span>
                                </div>
                                <h2 className="featured-title">{featuredPost.title}</h2>
                                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                                <Link href={`/blog/${featuredPost.id}`} className="btn-read-more">
                                    Read Article &rarr;
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Recent Articles Grid */}
                <div className="posts-grid-container">
                    <div className="posts-grid">
                        {gridPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="blog-grid-card"
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="card-image"
                                    />
                                </div>
                                <div className="card-body">
                                    <div>
                                        <div className="post-meta-row" style={{ marginBottom: '10px' }}>
                                            <span className="post-category-tag">{post.category}</span>
                                            <span className="post-dot"></span>
                                            <span className="post-read-time">{post.readingTime}</span>
                                        </div>
                                        <h3>{post.title}</h3>
                                        <p className="card-excerpt">{post.excerpt}</p>
                                    </div>
                                    <Link href={`/blog/${post.id}`} className="btn-read-more">
                                        Read Article &rarr;
                                    </Link>
                                </div>
                            </motion.div>
                        ))}

                        {filteredPosts.length === 0 && (
                            <div className="no-results-state">
                                <h3>No stories found</h3>
                                <p style={{ marginTop: '10px' }}>We couldn't find any articles matching "{searchQuery}" in category "{selectedCategory}".</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Secret Admin Publish Trigger */}
            <button
                className="btn-admin-trigger"
                onClick={() => setIsAdminOpen(true)}
                title="Admin Publishing Panel"
            >
                ⚙️
            </button>

            {/* Admin Publishing Modal */}
            <AnimatePresence>
                {isAdminOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setIsAdminOpen(false);
                            setAdminError('');
                            setPublishSuccess(null);
                        }}
                    >
                        <motion.div
                            className="modal-inner"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '650px', width: '90%' }}
                        >
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setIsAdminOpen(false);
                                    setAdminError('');
                                    setPublishSuccess(null);
                                }}
                            >
                                &times;
                            </button>

                            {!isAuthed ? (
                                <div className="admin-auth-container">
                                    <h2 className="modal-title">Admin Authentication</h2>
                                    <p className="modal-subtitle" style={{ marginBottom: '15px' }}>
                                        Please enter the WhoAmI API key to access the publishing dashboard.
                                    </p>
                                    <form onSubmit={handleAuth}>
                                        <input
                                            type="password"
                                            placeholder="Enter RELOAD_API_KEY..."
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                        {adminError && <div className="error-message" style={{ marginTop: '10px' }}>{adminError}</div>}
                                        <button type="submit" className="submit-btn" style={{ marginTop: '15px', width: '100%' }}>
                                            Unlock Publisher
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <h2 className="modal-title">Publish New Story</h2>
                                    <p className="modal-subtitle" style={{ marginBottom: '20px' }}>
                                        Publishing will add the post to WhoAmI and automatically create a syndication teaser on WordPress.
                                    </p>

                                    <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <input
                                            type="text"
                                            placeholder="Article Title (e.g. Behind the Build: 3D Printing in Jaipur)"
                                            value={newPostData.title}
                                            onChange={(e) => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                                            required
                                        />

                                        <div className="admin-form-row">
                                            <div className="admin-select-wrapper">
                                                <label>Category</label>
                                                <select
                                                    className="admin-select"
                                                    value={newPostData.category}
                                                    onChange={(e) => setNewPostData(prev => ({ ...prev, category: e.target.value }))}
                                                >
                                                    {CATEGORIES.slice(1).map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="admin-select-wrapper">
                                                <label>Featured Image URL (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="/products/grogu/grogu-1.webp"
                                                    value={newPostData.image}
                                                    onChange={(e) => setNewPostData(prev => ({ ...prev, image: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Comma-separated tags (e.g. 3D Printing, Jaipur, Behind the Build)"
                                            value={newPostData.tags}
                                            onChange={(e) => setNewPostData(prev => ({ ...prev, tags: e.target.value }))}
                                        />

                                        <textarea
                                            placeholder="Short excerpt summarizing the article (100–200 words)..."
                                            rows="3"
                                            value={newPostData.excerpt}
                                            onChange={(e) => setNewPostData(prev => ({ ...prev, excerpt: e.target.value }))}
                                            required
                                        />

                                        <textarea
                                            placeholder="Full article content (supports HTML tags)..."
                                            rows="8"
                                            value={newPostData.content}
                                            onChange={(e) => setNewPostData(prev => ({ ...prev, content: e.target.value }))}
                                            required
                                        />

                                        {adminError && <div className="error-message">{adminError}</div>}

                                        {publishSuccess && (
                                            <div className="syndication-success-badge">
                                                <strong>✨ Article published successfully!</strong>
                                                <br />
                                                Local JSON file updated.
                                                {publishSuccess.wordpress && publishSuccess.wordpress.syndicated ? (
                                                    <span style={{ display: 'block', marginTop: '5px' }}>
                                                        🔗 Teaser syndicated to WordPress: <a href={publishSuccess.wordpress.wpPostUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-warm-gold)', textDecoration: 'underline' }}>View WordPress Post</a>
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'block', marginTop: '5px', opacity: 0.8 }}>
                                                        ⚠️ WordPress syndication skipped: {publishSuccess.wordpress ? publishSuccess.wordpress.reason : 'Not configured'}
                                                    </span>
                                                )}
                                                <span style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                                                    *Don't forget to commit the changes to server/data/blog_posts.json to persist them permanently!
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            disabled={publishLoading}
                                            style={{ width: '100%', marginTop: '10px' }}
                                        >
                                            {publishLoading ? 'Publishing & Syndicating...' : 'Publish Post'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
