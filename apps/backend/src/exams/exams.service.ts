import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExamDto, CreateExamSubjectDto, RecordMarksDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.exam.findMany({
      where: { schoolId },
      include: {
        academicYear: true,
        examSubjects: {
          include: {
            class: true,
            _count: { select: { examResults: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createExam(schoolId: string, dto: CreateExamDto) {
    return this.prisma.exam.create({
      data: {
        schoolId,
        academicYearId: dto.academicYearId,
        name: dto.name,
        term: dto.term,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'UPCOMING',
      },
    });
  }

  async addExamSubject(schoolId: string, examId: string, dto: CreateExamSubjectDto) {
    const exam = await this.prisma.exam.findFirst({ where: { id: examId, schoolId } });
    if (!exam) {
      throw new NotFoundException(`Exam with ID '${examId}' not found`);
    }

    return this.prisma.examSubject.create({
      data: {
        examId,
        classId: dto.classId,
        subjectName: dto.subjectName,
        maxMarks: dto.maxMarks,
        passMarks: dto.passMarks,
        examDate: dto.examDate ? new Date(dto.examDate) : null,
      },
      include: { class: true },
    });
  }

  async recordMarks(schoolId: string, dto: RecordMarksDto) {
    const examSubject = await this.prisma.examSubject.findUnique({
      where: { id: dto.examSubjectId },
      include: { exam: true },
    });

    if (!examSubject || examSubject.exam.schoolId !== schoolId) {
      throw new NotFoundException(`Exam subject not found`);
    }

    const calculateGrade = (marks: number, max: number): string => {
      const percentage = (marks / max) * 100;
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B';
      if (percentage >= 60) return 'C';
      if (percentage >= 50) return 'D';
      return 'F';
    };

    const operations = dto.marks.map((item) =>
      this.prisma.examResult.upsert({
        where: {
          examSubjectId_studentId: {
            examSubjectId: dto.examSubjectId,
            studentId: item.studentId,
          },
        },
        update: {
          marksObtained: item.marksObtained,
          grade: calculateGrade(item.marksObtained, examSubject.maxMarks),
          remarks: item.remarks,
        },
        create: {
          examSubjectId: dto.examSubjectId,
          studentId: item.studentId,
          marksObtained: item.marksObtained,
          grade: calculateGrade(item.marksObtained, examSubject.maxMarks),
          remarks: item.remarks,
        },
      })
    );

    return this.prisma.$transaction(operations);
  }

  async getStudentReportCard(schoolId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        class: true,
        section: true,
        examResults: {
          include: {
            examSubject: {
              include: {
                exam: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student not found`);
    }

    const results = student.examResults.map((r) => ({
      examName: r.examSubject.exam.name,
      term: r.examSubject.exam.term,
      subjectName: r.examSubject.subjectName,
      maxMarks: r.examSubject.maxMarks,
      passMarks: r.examSubject.passMarks,
      marksObtained: r.marksObtained,
      grade: r.grade,
      remarks: r.remarks,
    }));

    const totalObtained = results.reduce((acc, curr) => acc + curr.marksObtained, 0);
    const totalMax = results.reduce((acc, curr) => acc + curr.maxMarks, 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        className: student.class?.name || 'Unassigned',
        sectionName: student.section?.name || 'Unassigned',
      },
      results,
      summary: {
        totalObtained,
        totalMax,
        percentage: Math.round(percentage * 10) / 10,
        overallGrade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F',
      },
    };
  }
}
