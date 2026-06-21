import { prisma } from '@/lib/db';

export default async function sitemap() {
  // Replace with production URL if available
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const baseRoutes = ['', '/browse', '/archive', '/bookmarks', '/admin'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const papers = await prisma.paper.findMany();
    const paperRoutes = papers.map((paper) => {
      const cleanBranch = encodeURIComponent(paper.branch.toLowerCase().replace(/\s+/g, '-'));
      const cleanSem = encodeURIComponent(paper.semester.toLowerCase().replace(/\s+/g, '-'));
      const cleanSubject = encodeURIComponent(
        paper.subjectName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
      
      return {
        url: `${baseUrl}/papers/${cleanBranch}/${cleanSem}/${cleanSubject}/${paper.year}?id=${paper.id}`,
        lastModified: paper.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      };
    });

    return [...baseRoutes, ...paperRoutes];
  } catch (err) {
    console.error('Failed to generate sitemap', err);
    return baseRoutes;
  }
}
