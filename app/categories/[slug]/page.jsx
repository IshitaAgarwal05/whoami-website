import ProductsClient from '../../products/ProductsClient';
import Breadcrumbs from '../../../components/Breadcrumbs/Breadcrumbs';
import { slugify } from '../../../utils/slugify';
import { notFound } from 'next/navigation';

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const [productsRes, combosRes] = await Promise.all([
    fetch(`${baseUrl}/api/products`, { next: { revalidate: 3600 } }),
    fetch(`${baseUrl}/api/products/combos`, { next: { revalidate: 3600 } })
  ]);

  const products = await productsRes.json();
  const combos = await combosRes.json();

  return {
    allProducts: products.success ? products.data : [],
    combos: combos.success ? combos.data : []
  };
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const res = await fetch(`${baseUrl}/api/products`);
  const json = await res.json();
  
  if (!json.success) return [];
  
  const categories = [...new Set(json.data.map(p => p.Category))].filter(Boolean);
  
  return categories.map((cat) => ({
    slug: slugify(cat),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { allProducts } = await getData();
  
  const category = [...new Set(allProducts.map(p => p.Category))].find(c => slugify(c) === slug);
  if (!category) return { title: 'Category Not Found | WhoAmI' };
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const description = `Explore our curated collection of handcrafted ${category} identity artifacts. Designed in Jaipur for those who value subtle expression and premium craft.`;
  
  return {
    title: `${category} Collection | WhoAmI`,
    description: description,
    alternates: {
      canonical: `${siteUrl}/categories/${slug}`,
    },
    openGraph: {
      title: `${category} | Identity Artifacts`,
      description: description,
      url: `${siteUrl}/categories/${slug}`,
      siteName: 'WhoAmI',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category} Collection`,
      description: description,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const { allProducts, combos } = await getData();
  
  const category = [...new Set(allProducts.map(p => p.Category))].find(c => slugify(c) === slug);
  
  if (!category) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
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
        name: category,
        item: `${siteUrl}/categories/${slug}`,
      },
    ],
  };

  // Filter products for this category
  const filteredProducts = allProducts.filter(p => p.Category === category);
  const breadcrumbItems = [{ label: category }];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="category-intro container" style={{ padding: '0 0 2rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#FDD835' }}>{category}</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '800px' }}>
          Discover our exclusive {category} collection, where every piece is an artifact of identity. 
          Crafted in the heart of Jaipur, these designs blend traditional inspiration with modern 
          3D printing and laser-cut precision.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '800px', marginTop: '1rem' }}>
          Whether you're decorating your workspace or looking for a meaningful gift, our {category} 
          artifacts offer a subtle rebellion against the generic. Find the symbol that speaks for you.
        </p>
      </div>

      <ProductsClient 
        initialProducts={filteredProducts}
        initialHasMore={false}
        combos={combos}
        forcedCategory={category}
      />
    </>
  );
}
