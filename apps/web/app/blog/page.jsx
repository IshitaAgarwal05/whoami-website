import BlogClient from './BlogClient';
import config from '../../config';

async function getBlogPosts() {
    const baseUrl = config.API_BASE_URL;
    try {
        const response = await fetch(`${baseUrl}/api/blog`, { next: { revalidate: 60 } });
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const payload = await response.json();
        return payload.success ? payload.data : [];
    } catch (e) {
        console.error('Error fetching blog posts for SSR:', e);
        return [];
    }
}

export const generateMetadata = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
    const description = 'Discover behind-the-scenes building processes, low-poly design insights, 3D printing features, and tabletop inspiration on the WhoAmI journal.';

    return {
        title: 'WhoAmI Journal | Fandom Collectibles & Desk Setup Hub',
        description: description,
        alternates: {
            canonical: `${siteUrl}/blog`,
        },
        openGraph: {
            title: 'WhoAmI Journal | Fandom Collectibles & Desk Setup Hub',
            description: description,
            url: `${siteUrl}/blog`,
            siteName: 'WhoAmI',
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: 'WhoAmI Journal | Fandom Collectibles & Desk Inspiration',
            description: description,
        },
    };
};

export default async function BlogPage() {
    const posts = await getBlogPosts();
    return <BlogClient initialPosts={posts} />;
}
