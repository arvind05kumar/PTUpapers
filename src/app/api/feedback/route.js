import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { paperId, issueType, message } = body;

    if (!paperId || !issueType || !message) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Verify paper exists
    const paper = await prisma.paper.findUnique({
      where: { id: paperId }
    });

    if (!paper) {
      return NextResponse.json({ success: false, message: 'Associated paper not found' }, { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        paperId,
        issueType,
        message
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session || session.value !== 'true') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        paper: true
      }
    });

    return NextResponse.json({ success: true, feedbacks });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
