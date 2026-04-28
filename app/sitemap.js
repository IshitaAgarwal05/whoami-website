import { slugify } from '../utils/slugify';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  // Base routes
  const routes = ['', '/products', '/about', '/contact', '/faq'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch products
    const res = await fetch(`${apiBaseUrl}/api/products`);
    const json = await res.json();

    if (json.success) {
      // Product pages
      const productRoutes = json.data.map((product) => ({
        url: `${baseUrl}/products/${slugify(product.Name)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

      // Category pages
      const categories = [...new Set(json.data.map(p => p.Category))].filter(Boolean);
      const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/categories/${slugify(cat)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      }));

      return [...routes, ...productRoutes, ...categoryRoutes];
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return routes;
}
