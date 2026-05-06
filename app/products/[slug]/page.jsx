import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { slugify } from '../../../utils/slugify';
import { getProductImages } from '../../../utils/imageUtils';
import config from '../../../config';

async function getProductAndRelated(slug) {
  const baseUrl = config.API_BASE_URL;
  
  try {
    const [productsRes, combosRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/products/combos`, { next: { revalidate: 3600 } })
    ]);

    if (!productsRes.ok && !combosRes.ok) return { product: null, related: [] };

    const productsJson = await productsRes.json();
    const combosJson = combosRes.ok ? await combosRes.json() : { success: false };

    const products = productsJson.success ? productsJson.data : [];
    const combos = combosJson.success ? combosJson.data : [];

    // Search in products first, then combos
    let product = products.find(p => slugify(p.Name) === slug);
    let sourceList = products;

    if (!product) {
      product = combos.find(c => slugify(c.Name) === slug);
      sourceList = combos;
    }

    if (!product) return { product: null, related: [] };

    const showOnlyWithImages = process.env.NEXT_PUBLIC_SHOW_NO_IMAGE_PRODUCTS !== 'true';

    let related = sourceList
      .filter(p => p.Category === product.Category && p.ID !== product.ID);

    if (showOnlyWithImages) {
      related = related.filter(p => 
        p.ImageURL && 
        p.ImageURL !== '/products/placeholder.webp' && 
        !p.ImageURL.includes('placehold.co')
      );
    }

    related = related.slice(0, 4);

    return { product, related };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return { product: null, related: [] };
  }
}

export async function generateStaticParams() {
  const baseUrl = config.API_BASE_URL;

  try {
    const [productsRes, combosRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/products/combos`)
    ]);

    const productsJson = await productsRes.json();
    const combosJson = combosRes.ok ? await combosRes.json() : { success: false };

    const products = productsJson.success ? productsJson.data : [];
    const combos = combosJson.success ? combosJson.data : [];

    return [...products, ...combos].map((item) => ({
      slug: slugify(item.Name),
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
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
      type: 'website',
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
  const { slug } = await params;
  const { product, related } = await getProductAndRelated(slug);
  
  if (!product) {
    notFound();
  }

  // Get all product images on the server using fs
  const productImages = getProductImages(product.ImageURL);

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
        name: 'Products',
        item: `${siteUrl}/products`,
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
        productImages={productImages}
      />
    </>
  );
}
