import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

const papers = [
  // B.Tech CSE - Semester 3
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Data Structures & Algorithms",
    subjectCode: "BTCS-301",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 342,
    downloadCount: 215
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Data Structures & Algorithms",
    subjectCode: "BTCS-301",
    year: 2022,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 412,
    downloadCount: 310
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Data Structures & Algorithms",
    subjectCode: "BTCS-301",
    year: 2023,
    examType: "Mid-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 120,
    downloadCount: 95
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Object Oriented Programming",
    subjectCode: "BTCS-302",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 231,
    downloadCount: 142
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Computer Architecture & Organization",
    subjectCode: "BTCS-303",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 198,
    downloadCount: 110
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 3",
    subjectName: "Digital Electronics",
    subjectCode: "BTCS-305",
    year: 2022,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 176,
    downloadCount: 94
  },

  // B.Tech CSE - Semester 4
  {
    branch: "B.Tech CSE",
    semester: "Semester 4",
    subjectName: "Operating Systems",
    subjectCode: "BTCS-401",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 295,
    downloadCount: 187
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 4",
    subjectName: "Design & Analysis of Algorithms",
    subjectCode: "BTCS-402",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 310,
    downloadCount: 202
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 4",
    subjectName: "Database Management Systems",
    subjectCode: "BTCS-403",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 280,
    downloadCount: 175
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 4",
    subjectName: "Database Management Systems",
    subjectCode: "BTCS-403",
    year: 2022,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 190,
    downloadCount: 115
  },

  // B.Tech CSE - Semester 5
  {
    branch: "B.Tech CSE",
    semester: "Semester 5",
    subjectName: "Formal Languages & Automata Theory",
    subjectCode: "BTCS-501",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 145,
    downloadCount: 88
  },
  {
    branch: "B.Tech CSE",
    semester: "Semester 5",
    subjectName: "Software Engineering",
    subjectCode: "BTCS-502",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 167,
    downloadCount: 102
  },

  // B.Tech ECE - Semester 3
  {
    branch: "B.Tech ECE",
    semester: "Semester 3",
    subjectName: "Network Analysis & Synthesis",
    subjectCode: "BTEC-301",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 154,
    downloadCount: 92
  },
  {
    branch: "B.Tech ECE",
    semester: "Semester 3",
    subjectName: "Electronic Devices",
    subjectCode: "BTEC-302",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 188,
    downloadCount: 114
  },
  {
    branch: "B.Tech ECE",
    semester: "Semester 3",
    subjectName: "Signals & Systems",
    subjectCode: "BTEC-303",
    year: 2022,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 210,
    downloadCount: 130
  },

  // BCA - Semester 1
  {
    branch: "BCA",
    semester: "Semester 1",
    subjectName: "Programming in C",
    subjectCode: "UGCA-1901",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 420,
    downloadCount: 312
  },
  {
    branch: "BCA",
    semester: "Semester 1",
    subjectName: "Fundamentals of Computer & IT",
    subjectCode: "UGCA-1902",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 380,
    downloadCount: 270
  },

  // BCA - Semester 2
  {
    branch: "BCA",
    semester: "Semester 2",
    subjectName: "Data Structures",
    subjectCode: "UGCA-1907",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 290,
    downloadCount: 195
  },
  {
    branch: "BCA",
    semester: "Semester 2",
    subjectName: "OOP using C++",
    subjectCode: "UGCA-1908",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 315,
    downloadCount: 220
  },

  // MBA - Semester 1
  {
    branch: "MBA",
    semester: "Semester 1",
    subjectName: "Foundation of Management",
    subjectCode: "MBA-101",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 212,
    downloadCount: 148
  },
  {
    branch: "MBA",
    semester: "Semester 1",
    subjectName: "Managerial Economics",
    subjectCode: "MBA-102",
    year: 2023,
    examType: "End-term",
    pdfUrl: "/uploads/sample.pdf",
    viewCount: 189,
    downloadCount: 121
  }
];

async function main() {
  console.log("Cleaning Database...");
  await prisma.feedback.deleteMany({});
  await prisma.paper.deleteMany({});

  console.log("Seeding Papers...");
  for (const paper of papers) {
    await prisma.paper.create({
      data: paper
    });
  }

  console.log(`Database seeded successfully! Seeded ${papers.length} papers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
