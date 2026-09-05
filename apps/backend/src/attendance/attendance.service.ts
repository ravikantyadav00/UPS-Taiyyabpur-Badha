import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BulkAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClassAndDate(schoolId: string, classId: string, sectionId?: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    // Normalize date to start of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const where: any = {
      schoolId,
      classId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (sectionId) where.sectionId = sectionId;

    return this.prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
      },
      orderBy: { student: { firstName: 'asc' } },
    });
  }

  async recordBulkAttendance(schoolId: string, dto: BulkAttendanceDto) {
    const targetDate = new Date(dto.date);
    targetDate.setHours(0, 0, 0, 0);

    const operations = dto.records.map((item) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: item.studentId,
            date: targetDate,
          },
        },
        update: {
          status: item.status,
          remarks: item.remarks,
        },
        create: {
          schoolId,
          classId: dto.classId,
          sectionId: dto.sectionId,
          studentId: item.studentId,
          date: targetDate,
          status: item.status,
          remarks: item.remarks,
        },
      })
    );

    return this.prisma.$transaction(operations);
  }

  async getSummary(schoolId: string, classId?: string) {
    const where: any = { schoolId };
    if (classId) where.classId = classId;

    const totalRecords = await this.prisma.attendance.count({ where });
    const presentCount = await this.prisma.attendance.count({ where: { ...where, status: 'PRESENT' } });
    const absentCount = await this.prisma.attendance.count({ where: { ...where, status: 'ABSENT' } });
    const lateCount = await this.prisma.attendance.count({ where: { ...where, status: 'LATE' } });

    const attendanceRate = totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 100;

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
    };
  }
}
