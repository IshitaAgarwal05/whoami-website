const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const wordpressService = require('../services/wordpressService');

const blogJsonPath = path.join(__dirname, '../data/blog_posts.json');

// Helper to read posts from local json
function readBlogPosts() {
    try {
        if (!fs.existsSync(blogJsonPath)) {
            return [];
        }
        const raw = fs.readFileSync(blogJsonPath, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error reading blog_posts.json:', e);
        return [];
    }
}

// Helper to write posts back to local json
function writeBlogPosts(posts) {
    try {
        fs.writeFileSync(blogJsonPath, JSON.stringify(posts, null, 4), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing blog_posts.json:', e);
        return false;
    }
}

// Auth middleware matching products reload security
const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.RELOAD_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Provide a valid x-api-key header.' });
    }
    next();
};

/**
 * GET /api/blog
 * Get all blog posts
 */
router.get('/', (req, res) => {
    const posts = readBlogPosts();
    res.json({
        success: true,
        count: posts.length,
        data: posts
    });
});

/**
 * GET /api/blog/:slug
 * Get single blog post by slug ID
 */
router.get('/:slug', (req, res) => {
    const { slug } = req.params;
    const posts = readBlogPosts();
    const post = posts.find(p => p.id === slug);

    if (!post) {
        return res.status(404).json({
            success: false,
            error: 'Blog article not found'
        });
    }

    // Return the post plus some related posts (same category, excluding current post)
    const related = posts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3);

    res.json({
        success: true,
        data: post,
        related
    });
});

/**
 * POST /api/blog/publish
 * Publish a new blog post & syndicate to WordPress
 */
router.post('/publish', requireApiKey, async (req, res) => {
    try {
        const { title, excerpt, content, category, image, tags } = req.body;

        if (!title || !content || !excerpt) {
            return res.status(400).json({
                success: false,
                error: 'Please provide title, content, and excerpt.'
            });
        }

        // Generate a URL-friendly slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const posts = readBlogPosts();

        // Check for duplicates
        if (posts.some(p => p.id === slug)) {
            return res.status(400).json({
                success: false,
                error: 'An article with a similar title already exists.'
            });
        }

        // Parse tags
        const parsedTags = Array.isArray(tags)
            ? tags
            : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []);

        // Calculate reading time roughly: ~200 words per min
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readTimeNum = Math.max(1, Math.ceil(wordCount / 200));
        const readingTime = `${readTimeNum} min read`;

        const newPost = {
            id: slug,
            title,
            category: category || 'Collectibles',
            excerpt,
            content,
            image: image || '/products/grogu/grogu-1.webp',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            tags: parsedTags,
            readingTime
        };

        // 1. Syndicate to WordPress
        console.log(`Syndicating post "${title}" to WordPress...`);
        const wpResult = await wordpressService.syndicateTeaser(newPost);

        if (wpResult.syndicated) {
            newPost.wordpressPostId = wpResult.wpPostId;
            newPost.wordpressPostUrl = wpResult.wpPostUrl;
        }

        // 2. Append locally
        posts.unshift(newPost);
        const writeSuccess = writeBlogPosts(posts);

        if (!writeSuccess) {
            return res.status(500).json({
                success: false,
                error: 'Failed to write blog post data to disk locally.'
            });
        }

        res.json({
            success: true,
            message: 'Blog post created and published successfully!',
            data: newPost,
            wordpress: wpResult
        });

    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
