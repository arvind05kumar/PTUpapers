import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== 'view' && action !== 'download') {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    const updatedPaper = await prisma.paper.update({
      where: { id },
      data: {
        viewCount: action === 'view' ? { increment: 1 } : undefined,
        downloadCount: action === 'download' ? { increment: 1 } : undefined
      }
    });

    return NextResponse.json({ success: true, paper: updatedPaper });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session || session.value !== 'true') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const paper = await prisma.paper.findUnique({
      where: { id }
    });

    if (!paper) {
      return NextResponse.json({ success: false, message: 'Paper not found' }, { status: 404 });
    }

    // Safely delete associated PDF file if it is stored locally (excluding sample.pdf)
    if (paper.pdfUrl.startsWith('/uploads/') && !paper.pdfUrl.endsWith('sample.pdf')) {
      const filePath = path.join(process.cwd(), 'public', paper.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.paper.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
