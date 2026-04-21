import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { slugify } from '../../../src/utils/slugify';

async function getProductAndRelated(slug) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const res = await fetch(`${baseUrl}/api/products`, {
    next: { revalidate: 3600 }
  });
  
  if (!res.ok) return { product: null, related: [] };
  
  const json = await res.json();
  if (!json.success) return { product: null, related: [] };
  
  const product = json.data.find(p => slugify(p.Name) === slug);
  if (!product) return { product: null, related: [] };

  const related = json.data
    .filter(p => p.Category === product.Category && p.ID !== product.ID)
    .slice(0, 4);

  return { product, related };
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const res = await fetch(`${baseUrl}/api/products`);
  const json = await res.json();
  
  if (!json.success) return [];
  
  return json.data.map((product) => ({
    slug: slugify(product.Name),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const { product } = await getProductAndRelated(slug);
  
  if (!product) return { title: 'Product Not Found | WhoAmI' };
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const description = product.Description || `Handcrafted ${product.Category} identity artifact from WhoAmI Jaipur.`;
  
  return {
    title: `${product.Name} | WhoAmI`,
    description: description,
    alternates: {
      canonical: `${siteUrl}/products/${slug}`,
    },
    openGraph: {
      title: `${product.Name} | Identity Artifacts`,
      description: description,
      url: `${siteUrl}/products/${slug}`,
      siteName: 'WhoAmI',
      images: [
        {
          url: product.ImageURL,
          width: 800,
          height: 800,
          alt: product.Name,
        },
      ],
      locale: 'en_IN',
      type: 'og:product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.Name,
      description: description,
      images: [product.ImageURL],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  const { product, related } = await getProductAndRelated(slug);
  
  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.Name,
    image: product.ImageURL,
    description: product.Description,
    sku: product.ID.toString(),
    brand: {
      '@type': 'Brand',
      name: 'WhoAmI',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${slug}`,
      priceCurrency: 'INR',
      price: product.Price,
      availability: 'https://schema.org/InStock',
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.Category || 'Products',
        item: `${siteUrl}/categories/${slugify(product.Category || 'Products')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.Name,
        item: `${siteUrl}/products/${slug}`,
      },
    ],
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient 
        product={product} 
        relatedProducts={related}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
