import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const branch = searchParams.get('branch') || '';
    const semester = searchParams.get('semester') || '';
    const subjectCode = searchParams.get('subjectCode') || '';
    const subjectName = searchParams.get('subjectName') || '';
    const year = searchParams.get('year') || '';
    const examType = searchParams.get('examType') || '';
    const limit = searchParams.get('limit') || '';

    const where = {};

    if (branch) where.branch = branch;
    if (semester) where.semester = semester;
    if (subjectCode) where.subjectCode = subjectCode;
    if (subjectName) where.subjectName = subjectName;
    if (year) where.year = parseInt(year);
    if (examType) where.examType = examType;

    if (search) {
      const orConditions = [
        { subjectName: { contains: search } },
        { subjectCode: { contains: search } },
        { branch: { contains: search } }
      ];
      
      const searchAsInt = parseInt(search);
      if (!isNaN(searchAsInt)) {
        orConditions.push({ year: searchAsInt });
      }

      where.OR = orConditions;
    }

    const papers = await prisma.paper.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {})
    });

    // Extract all unique filters from DB for populating select dropdowns
    const allPapers = await prisma.paper.findMany();
    
    const branches = [...new Set(allPapers.map(p => p.branch))].sort();
    const semesters = [...new Set(allPapers.map(p => p.semester))].sort((a, b) => {
      // Sort semester values (e.g., "Semester 1", "Semester 2") numerically
      const getNum = (str) => {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      return getNum(a) - getNum(b);
    });
    
    // Group and unique subjects
    const subjects = allPapers.reduce((acc, p) => {
      if (!acc.some(s => s.code === p.subjectCode)) {
        acc.push({ name: p.subjectName, code: p.subjectCode });
      }
      return acc;
    }, []).sort((a, b) => a.name.localeCompare(b.name));

    const years = [...new Set(allPapers.map(p => p.year))].sort((a, b) => b - a);
    const examTypes = [...new Set(allPapers.map(p => p.examType))].sort();

    return NextResponse.json({
      papers,
      filters: {
        branches,
        semesters,
        subjects,
        years,
        examTypes
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session || session.value !== 'true') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch, semester, subjectName, subjectCode, year, examType, pdfUrl } = body;

    if (!branch || !semester || !subjectName || !subjectCode || !year || !examType || !pdfUrl) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const paper = await prisma.paper.create({
      data: {
        branch,
        semester,
        subjectName,
        subjectCode,
        year: parseInt(year),
        examType,
        pdfUrl
      }
    });

    return NextResponse.json({ success: true, paper });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
