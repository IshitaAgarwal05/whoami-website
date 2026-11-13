import ProductsClient from './ProductsClient';
import config from '../../config';
import { getFirstProductImage } from '../../utils/imageUtils';

async function getData() {
  const baseUrl = config.API_BASE_URL;

  try {
    const [allProductsRes, combosRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/products/combos`, { next: { revalidate: 60 } })
    ]);

    const allProducts = allProductsRes.ok ? await allProductsRes.json() : { success: false };
    const combos = combosRes.ok ? await combosRes.json() : { success: false };

    const rawProducts = allProducts.success ? allProducts.data : [];
    // Filter out hidden products (Stock === -1 or Stock < 0)
    const visibleProducts = rawProducts.filter(p => p.Stock === undefined || p.Stock === null || p.Stock >= 0);

    // Extract all categories from the visible product list
    const allCategories = visibleProducts.length > 0
      ? [...new Set(visibleProducts.map(p => p.Category))].filter(Boolean)
      : [];

    return {
      allProducts: visibleProducts,
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

  const resolvedProducts = allProducts.map(p => ({
    ...p,
    ImageURL: getFirstProductImage(p.FolderURL || p.ImageURL) || p.ImageURL
  }));

  const resolvedCombos = combos.map(c => ({
    ...c,
    ImageURL: getFirstProductImage(c.FolderURL || c.ImageURL) || c.ImageURL
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductsClient 
        allProducts={resolvedProducts}
        combos={resolvedCombos}
        allCategories={allCategories}
      />
    </>
  );
}

