const express = require('express');
const router = express.Router();
const axios = require('axios');
const wordpressService = require('../services/wordpressService');

const STRAPI_BASE = process.env.STRAPI_API_URL || 'http://localhost:1337';

function formatBlog(b) {
    if (!b) return null;
    let imageUrl = '';
    if (b.image && b.image.url) {
        imageUrl = b.image.url.startsWith('http') ? b.image.url : `${STRAPI_BASE}${b.image.url}`;
    } else {
        imageUrl = '/products/grogu/grogu-1.webp';
    }

    return {
        id: b.slug,
        title: b.title,
        category: b.category || 'Collectibles',
        excerpt: b.excerpt || '',
        content: b.content || '',
        image: imageUrl,
        date: b.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        tags: b.tags || [],
        readingTime: b.reading_time || '3 min read',
        wordpressPostId: b.wordpressPostId || null,
        wordpressPostUrl: b.wordpressPostUrl || null
    };
}

const requireApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.RELOAD_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Provide a valid x-api-key header.' });
    }
    next();
};

/**
 * @openapi
 * /blog:
 *   get:
 *     summary: Retrieve a list of blog articles
 *     description: Fetch blog posts from Strapi ordered by publication date.
 *     responses:
 *       200:
 *         description: A JSON array of blog posts.
 */
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${STRAPI_BASE}/api/blogs?populate=*&sort=createdAt:desc`);
        const posts = response.data.data || [];
        const formatted = posts.map(p => formatBlog(p));
        res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error('Error fetching blogs from Strapi:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
    }
});

/**
 * @openapi
 * /blog/{slug}:
 *   get:
 *     summary: Retrieve a single blog post
 *     description: Fetch blog post by slug along with related posts.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post details and related list.
 *       404:
 *         description: Article not found.
 */
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const response = await axios.get(`${STRAPI_BASE}/api/blogs?filters[slug][$eq]=${slug}&populate=*`);
        const posts = response.data.data || [];
        
        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Blog article not found'
            });
        }

        const post = formatBlog(posts[0]);

        // Get related posts (exclude current)
        const relatedResponse = await axios.get(`${STRAPI_BASE}/api/blogs?filters[slug][$ne]=${slug}&pagination[limit]=3&populate=*`);
        const relatedPosts = relatedResponse.data.data || [];
        const related = relatedPosts.map(p => formatBlog(p));

        res.json({
            success: true,
            data: post,
            related
        });
    } catch (error) {
        console.error('Error fetching single blog from Strapi:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch blog post' });
    }
});

/**
 * @openapi
 * /blog/publish:
 *   post:
 *     summary: Create and publish a new blog post
 *     description: Publish blog post in Strapi CMS and syndicate teaser to WordPress.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - excerpt
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Blog post created successfully.
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

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const checkDup = await axios.get(`${STRAPI_BASE}/api/blogs?filters[slug][$eq]=${slug}`);
        if (checkDup.data.data && checkDup.data.data.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'An article with a similar title already exists.'
            });
        }

        const parsedTags = Array.isArray(tags)
            ? tags
            : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []);

        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readTimeNum = Math.max(1, Math.ceil(wordCount / 200));
        const readingTime = `${readTimeNum} min read`;

        const newPostData = {
            title,
            slug,
            excerpt,
            content,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            reading_time: readingTime,
            tags: parsedTags,
            category: category || 'Collectibles'
        };

        console.log(`Syndicating post "${title}" to WordPress...`);
        const wpResult = await wordpressService.syndicateTeaser({
            id: slug,
            title,
            excerpt,
            content,
            image: image || '/products/grogu/grogu-1.webp',
            tags: parsedTags,
            category: category || 'Collectibles'
        });

        if (wpResult.syndicated) {
            newPostData.wordpressPostId = wpResult.wpPostId;
            newPostData.wordpressPostUrl = wpResult.wpPostUrl;
        }

        const createResponse = await axios.post(`${STRAPI_BASE}/api/blogs`, {
            data: newPostData
        });

        const createdPost = formatBlog(createResponse.data.data);

        res.json({
            success: true,
            message: 'Blog post created and published successfully!',
            data: createdPost,
            wordpress: wpResult
        });

    } catch (error) {
        console.error('Error creating blog post in Strapi:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

module.exports = router;
