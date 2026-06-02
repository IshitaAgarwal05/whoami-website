'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import '../../../styles/Blog.css';

export default function ArticleClient({ post, related }) {
    return (
        <div className="article-page">
            <div className="article-container">
                {/* Back Button */}
                <Link href="/blog" className="btn-back">
                    &larr; Back to Journal
                </Link>

                {/* Article Header */}
                <header className="article-header">
                    <div className="post-meta-row">
                        <span className="post-category-tag">{post.category}</span>
                        <span className="post-dot"></span>
                        <span className="post-date-tag">{post.date}</span>
                        <span className="post-dot"></span>
                        <span className="post-read-time">{post.readingTime}</span>
                    </div>
                    <h1 className="article-title">{post.title}</h1>
                </header>

                {/* Featured Hero Image */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="article-hero-image-wrapper"
                >
                    <img
                        src={post.image}
                        alt={post.title}
                        className="article-hero-image"
                    />
                </motion.div>

                {/* Article Body */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="article-body-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags Footer */}
                {post.tags && post.tags.length > 0 && (
                    <div className="article-tags-footer">
                        {post.tags.map(tag => (
                            <span key={tag} className="article-tag-pill">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Related Posts */}
                {related && related.length > 0 && (
                    <section className="related-posts-section">
                        <h2>Related Stories</h2>
                        <div className="posts-grid" style={{ marginTop: '20px' }}>
                            {related.map((relPost, idx) => (
                                <motion.div
                                    key={relPost.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className="blog-grid-card"
                                >
                                    <div className="card-image-wrapper" style={{ height: '180px' }}>
                                        <img
                                            src={relPost.image}
                                            alt={relPost.title}
                                            className="card-image"
                                        />
                                    </div>
                                    <div className="card-body">
                                        <div>
                                            <div className="post-meta-row" style={{ marginBottom: '10px' }}>
                                                <span className="post-category-tag">{relPost.category}</span>
                                                <span className="post-dot"></span>
                                                <span className="post-read-time">{relPost.readingTime}</span>
                                            </div>
                                            <h3 style={{ fontSize: '18px' }}>{relPost.title}</h3>
                                        </div>
                                        <Link href={`/blog/${relPost.id}`} className="btn-read-more">
                                            Read &rarr;
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
