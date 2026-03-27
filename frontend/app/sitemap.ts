import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://emble.in';

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '', changeFrequency: 'daily', priority: 1 },
    { path: '/curriculum', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/how-it-works', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/stories', changeFrequency: 'weekly', priority: 0.88 },
    { path: '/simulations', changeFrequency: 'weekly', priority: 0.86 },
    { path: '/ai-mentors', changeFrequency: 'weekly', priority: 0.84 },
    { path: '/docs', changeFrequency: 'weekly', priority: 0.82 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.76 },
    { path: '/careers', changeFrequency: 'weekly', priority: 0.72 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.68 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.35 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.35 },
    { path: '/refund', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/copyright', changeFrequency: 'yearly', priority: 0.25 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
