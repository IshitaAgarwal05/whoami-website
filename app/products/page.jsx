import ProductsClient from './ProductsClient';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';

async function getData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const [productsRes, combosRes] = await Promise.all([
    fetch(`${baseUrl}/api/products?limit=20&offset=0`, { next: { revalidate: 60 } }),
    fetch(`${baseUrl}/api/products/combos`, { next: { revalidate: 60 } })
  ]);

  const products = await productsRes.json();
  const combos = await combosRes.json();

  return {
    initialProducts: products.success ? products.data : [],
    initialHasMore: products.success ? products.has_more : false,
    combos: combos.success ? combos.data : []
  };
}

export const generateMetadata = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const description = 'Explore our full collection of handcrafted identity artifacts. Designed in Jaipur for those who value subtle expression and premium craft.';
  
  return {
    title: 'Identity Artifacts Collection | WhoAmI',
    description: description,
    alternates: {
      canonical: `${siteUrl}/products`,
    },
    openGraph: {
      title: 'Shop Identity Artifacts | WhoAmI',
      description: description,
      url: `${siteUrl}/products`,
      siteName: 'WhoAmI',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'WhoAmI | Identity Artifacts',
      description: description,
    },
  };
};

export default async function ProductsPage() {
  const { initialProducts, initialHasMore, combos } = await getData();
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
        name: 'Products',
        item: `${siteUrl}/products`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Breadcrumbs items={[{ label: 'Products' }]} />
      <ProductsClient 
        initialProducts={initialProducts}
        initialHasMore={initialHasMore}
        combos={combos}
      />
    </>
  );
}
