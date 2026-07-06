import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient';
import config from '../../../config';

async function getArticleDetails(slug) {
    const baseUrl = config.API_BASE_URL;
    try {
        const response = await fetch(`${baseUrl}/api/blog/${slug}`, { next: { revalidate: 60 } });
        if (!response.ok) return null;
        const payload = await response.json();
        return payload.success ? { post: payload.data, related: payload.related || [] } : null;
    } catch (e) {
        console.error(`Error fetching article details for slug "${slug}":`, e);
        return null;
    }
}

export async function generateMetadata({ params }) {
    // Await params because Next.js 15+ params is a Promise
    const { slug } = await params;
    const data = await getArticleDetails(slug);
    
    if (!data) {
        return {
            title: 'Article Not Found | WhoAmI',
        };
    }

    const { post } = data;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
    
    return {
        title: `${post.title} | WhoAmI Journal`,
        description: post.excerpt,
        alternates: {
            canonical: `${siteUrl}/blog/${post.id}`,
        },
        openGraph: {
            title: `${post.title} | WhoAmI Journal`,
            description: post.excerpt,
            url: `${siteUrl}/blog/${post.id}`,
            siteName: 'WhoAmI',
            locale: 'en_IN',
            type: 'article',
            publishedTime: post.date,
            tags: post.tags,
            images: [
                {
                    url: `${siteUrl}${post.image}`,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: `${post.title} | WhoAmI Journal`,
            description: post.excerpt,
        },
    };
}

export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const data = await getArticleDetails(slug);

    if (!data) {
        notFound();
    }

    const { post, related } = data;
    return <ArticleClient post={post} related={related} />;
}
