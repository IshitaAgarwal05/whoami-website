import ProductsClient from './ProductsClient';
import config from '../../config';

async function getData() {
  const baseUrl = config.API_BASE_URL;

  try {
    const [allProductsRes, combosRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/products/combos`, { next: { revalidate: 60 } })
    ]);

    const allProducts = allProductsRes.ok ? await allProductsRes.json() : { success: false };
    const combos = combosRes.ok ? await combosRes.json() : { success: false };

    // Extract all categories from the full product list
    const allCategories = allProducts.success
      ? [...new Set(allProducts.data.map(p => p.Category))].filter(Boolean)
      : [];

    return {
      allProducts: allProducts.success ? allProducts.data : [],
      combos: combos.success ? combos.data : [],
      allCategories
    };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return { allProducts: [], combos: [], allCategories: [] };
  }
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
  const { allProducts, combos, allCategories } = await getData();
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
      <ProductsClient 
        allProducts={allProducts}
        combos={combos}
        allCategories={allCategories}
      />
    </>
  );
}

