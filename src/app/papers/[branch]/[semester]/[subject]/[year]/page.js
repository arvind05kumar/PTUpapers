import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PaperDetailsClient from './PaperDetailsClient';

// Dynamic SEO metadata generation
export async function generateMetadata({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;
  if (!id) return { title: 'Question Paper - PTU Papers' };

  try {
    const paper = await prisma.paper.findUnique({
      where: { id }
    });

    if (!paper) {
      return { title: 'Paper Not Found - PTU Papers' };
    }

    const title = `${paper.subjectName} (${paper.subjectCode}) PTU Previous Year Question Paper ${paper.year} - ${paper.branch} Sem ${paper.semester.replace(/\D/g, '')}`;
    const description = `Download the ${paper.year} PTU ${paper.branch} ${paper.semester} question paper for ${paper.subjectName} (${paper.subjectCode}) in PDF format. Free preview and download.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
      }
    };
  } catch (err) {
    console.error(err);
    return { title: 'Question Paper - PTU Papers' };
  }
}

export default async function PaperDetailPage({ params, searchParams }) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id;

  if (!id) {
    notFound();
  }

  // 1. Fetch paper details
  const paper = await prisma.paper.findUnique({
    where: { id }
  });

  if (!paper) {
    notFound();
  }

  // 2. Increment view count in background on server load
  try {
    await prisma.paper.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
  } catch (err) {
    console.error('Failed to increment view count', err);
  }

  // 3. Fetch related papers (same subject code, excluding current)
  const relatedPapers = await prisma.paper.findMany({
    where: {
      subjectCode: paper.subjectCode,
      id: { not: paper.id }
    },
    orderBy: { year: 'desc' },
    take: 5
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': `${paper.subjectName} (${paper.subjectCode}) PTU Previous Year Question Paper ${paper.year}`,
    'description': `Punjab Technical University (IKGPTU) previous year semester exam question paper for ${paper.subjectName} (${paper.subjectCode}), ${paper.branch} ${paper.semester}, ${paper.year}.`,
    'educationalLevel': `${paper.branch} ${paper.semester}`,
    'temporalCoverage': `${paper.year}`,
    'about': {
      '@type': 'Thing',
      'name': paper.subjectName,
      'alternateName': paper.subjectCode
    },
    'provider': {
      '@type': 'Organization',
      'name': 'I.K. Gujral Punjab Technical University',
      'alternateName': 'IKGPTU'
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex-1 bg-slate-50">
        <PaperDetailsClient paper={paper} relatedPapers={relatedPapers} />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:flex md:items-center md:justify-between">
          <p className="text-center text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} PTU Papers Portal. This portal is not affiliated with I.K. Gujral Punjab Technical University.
          </p>
        </div>
      </footer>
    </div>
  );
}
