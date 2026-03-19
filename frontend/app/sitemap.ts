import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://emble.in';
  
  // Define all static public routes
  const routes = [
    '',
    '/computer-science-placement-preparation',
    '/curriculum',
    '/pricing',
    '/faq',
    '/contact',
    '/stories',
    '/login/college',
    '/register/industry'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/computer-science-placement-preparation' ? 0.9 : 0.8,
  }));
}
