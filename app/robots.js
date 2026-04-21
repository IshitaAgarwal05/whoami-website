export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whoami.vercel.app'; // Replace with actual domain
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/auth/', '/checkout/', '/cart/', '/user/', '/internal/', '/tmp/', '/*?*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
