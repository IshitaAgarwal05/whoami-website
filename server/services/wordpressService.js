const path = require('path');
const fs = require('fs');

class WordpressService {
    async syndicateTeaser(post) {
        const username = process.env.WORDPRESS_USERNAME;
        const appPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;
        const wpSiteUrl = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || 'https://superiorishitaagarwal.wordpress.com';
        const whoamiSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        if (!username || !appPassword) {
            console.warn('⚠️ WordPress credentials (WORDPRESS_USERNAME, WORDPRESS_APPLICATION_PASSWORD) not found in environment variables. Skipping syndication.');
            return {
                syndicated: false,
                reason: 'Missing credentials in environment.'
            };
        }

        console.log(`WordPress Service: Syndicating teaser for "${post.title}" to ${wpSiteUrl}...`);

        const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');
        const articleUrl = `${whoamiSiteUrl.replace(/\/$/, '')}/blog/${post.id}`;

        let featuredMediaId = null;

        // 1. Upload Featured Image to WordPress Media Library
        if (post.image) {
            try {
                let imageBuffer;
                let fileName = 'featured-image.jpg';
                let mimeType = 'image/jpeg';

                if (post.image.startsWith('http')) {
                    const imgRes = await fetch(post.image);
                    if (imgRes.ok) {
                        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
                        fileName = path.basename(new URL(post.image).pathname) || fileName;
                        mimeType = imgRes.headers.get('content-type') || mimeType;
                    }
                } else {
                    // Local file resolution
                    const publicPath = path.join(__dirname, '../../public');
                    const localImagePath = path.join(publicPath, post.image);
                    if (fs.existsSync(localImagePath)) {
                        imageBuffer = fs.readFileSync(localImagePath);
                        fileName = path.basename(localImagePath);
                        if (fileName.endsWith('.webp')) mimeType = 'image/webp';
                        else if (fileName.endsWith('.png')) mimeType = 'image/png';
                    }
                }

                if (imageBuffer) {
                    const uploadUrl = `${wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/media`;
                    console.log(`WordPress Service: Uploading media "${fileName}" (${mimeType})...`);
                    
                    const mediaRes = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': authHeader,
                            'Content-Disposition': `attachment; filename="${fileName}"`,
                            'Content-Type': mimeType
                        },
                        body: imageBuffer
                    });

                    if (mediaRes.ok) {
                        const mediaData = await mediaRes.json();
                        featuredMediaId = mediaData.id;
                        console.log(`WordPress Service: Media uploaded successfully. ID: ${featuredMediaId}`);
                    } else {
                        const errTxt = await mediaRes.text();
                        console.warn(`WordPress Service: Media upload request failed: ${mediaRes.status} - ${errTxt}`);
                    }
                }
            } catch (mediaErr) {
                console.error('WordPress Service: Failed to process or upload featured image:', mediaErr);
            }
        }

        // 2. Resolve or Create Category ID on WordPress
        let categoryId = null;
        if (post.category) {
            categoryId = await this.getOrCreateTerm(post.category, 'categories', wpSiteUrl, authHeader);
        }

        // 3. Resolve or Create Tag IDs on WordPress
        const tagIds = [];
        if (post.tags && Array.isArray(post.tags)) {
            for (const tag of post.tags) {
                const tagId = await this.getOrCreateTerm(tag, 'tags', wpSiteUrl, authHeader);
                if (tagId) tagIds.push(tagId);
            }
        }

        // 4. Construct Teaser Content (HTML)
        const teaserContent = `
<p>${post.excerpt}</p>
<p><em>This is a preview of the full article originally published on the WhoAmI content hub.</em></p>
<p>At WhoAmI, we design premium fandom-inspired collectibles and desk decor, bridging modern engineering with local artisan craftsmanship. To read the complete article, see full-resolution builds, and join our collector community, view the full post on our website.</p>
<div style="margin: 25px 0;">
    <a href="${articleUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #d4af37; color: #000000; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 0.05em; font-size: 14px; box-shadow: 0 4px 12px rgba(212,175,55,0.25);">Read Full Article on WhoAmI &rarr;</a>
</div>
        `.trim();

        // 5. Publish Teaser Post to WordPress REST API
        const createPostUrl = `${wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
        const postData = {
            title: post.title,
            content: teaserContent,
            excerpt: post.excerpt,
            status: 'publish',
            categories: categoryId ? [categoryId] : [],
            tags: tagIds,
        };

        if (featuredMediaId) {
            postData.featured_media = featuredMediaId;
        }

        try {
            const response = await fetch(createPostUrl, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                const errTxt = await response.text();
                throw new Error(`WordPress post creation failed: ${response.status} - ${errTxt}`);
            }

            const wpPost = await response.json();
            console.log(`WordPress Service: Post syndicated successfully! URL: ${wpPost.link}`);

            return {
                syndicated: true,
                wpPostId: wpPost.id,
                wpPostUrl: wpPost.link
            };

        } catch (postErr) {
            console.error('WordPress Service: Failed to create teaser post on WordPress:', postErr);
            return {
                syndicated: false,
                reason: postErr.message
            };
        }
    }

    async getOrCreateTerm(termName, taxonomy, siteUrl, authHeader) {
        const endpoint = taxonomy === 'categories' ? 'categories' : 'tags';
        const searchUrl = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint}?search=${encodeURIComponent(termName)}`;

        try {
            const searchRes = await fetch(searchUrl, {
                headers: { 'Authorization': authHeader }
            });

            if (searchRes.ok) {
                const list = await searchRes.json();
                const existing = list.find(t => t.name.toLowerCase() === termName.toLowerCase());
                if (existing) return existing.id;
            }

            // Create if not found
            const createUrl = `${siteUrl.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint}`;
            const createRes = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: termName })
            });

            if (createRes.ok) {
                const data = await createRes.json();
                return data.id;
            }
        } catch (err) {
            console.error(`WordPress Service: Error finding/creating term "${termName}" for taxonomy "${taxonomy}":`, err);
        }
        return null;
    }
}

module.exports = new WordpressService();
