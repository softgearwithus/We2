import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/admin/', 
        '/api/',
        '/institute/dashboard/',
        '/industry/dashboard/'
      ],
    },
    sitemap: 'https://emble.in/sitemap.xml',
  };
}
