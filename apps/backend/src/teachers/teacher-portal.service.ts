import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface BulkAttendanceRecord {
  studentId: string;
  status: string; // PRESENT, ABSENT, LATE, EXCUSED
  remarks?: string;
}

export interface SubmitAttendanceDto {
  classId: string;
  sectionId?: string;
  date: string;
  records: BulkAttendanceRecord[];
}

@Injectable()
export class TeacherPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Helper: Retrieve Teacher record associated with logged-in user
   */
  async getTeacherByUserId(userId: string, schoolId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId, schoolId },
      include: {
        user: { select: { id: true, email: true, username: true, role: true } },
      },
    });

    if (!teacher) {
      throw new ForbiddenException('User is not registered as an active Teacher');
    }

    return teacher;
  }

  /**
   * Helper: Verify logged-in Teacher is assigned to classId (and sectionId if specified)
   */
  async verifyTeacherAssignment(teacherId: string, schoolId: string, classId: string, sectionId?: string) {
    const assignments = await this.prisma.teacherAssignment.findMany({
      where: {
        teacherId,
        schoolId,
        classId,
      },
    });

    if (!assignments || assignments.length === 0) {
      throw new ForbiddenException('Access denied. You are not assigned to this class.');
    }

    if (sectionId) {
      const hasSectionMatch = assignments.some((a) => !a.sectionId || a.sectionId === sectionId);
      if (!hasSectionMatch) {
        throw new ForbiddenException('Access denied. You are not assigned to this section.');
      }
    }

    return assignments[0];
  }

  /**
   * GET /api/teacher/me - Profile of logged-in teacher
   */
  async getProfile(userId: string, schoolId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId, schoolId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
          },
        },
        teacherAssignments: {
          include: {
            class: true,
            section: true,
            academicYear: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher;
  }

  /**
   * GET /api/teacher/dashboard-summary
   */
  async getDashboardSummary(userId: string, schoolId: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);

    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id, schoolId },
      include: {
        class: true,
        section: true,
      },
    });

    // Unique classes
    const myClassesCount = assignments.length;

    // Collect total assigned students
    let myStudentsCount = 0;
    const classSectionPairs: { classId: string; sectionId?: string | null; className: string; sectionName?: string }[] = [];

    for (const assign of assignments) {
      const studentWhere: any = { schoolId, classId: assign.classId, status: 'ACTIVE' };
      if (assign.sectionId) {
        studentWhere.OR = [{ sectionId: assign.sectionId }, { sectionId: null }];
      }

      const count = await this.prisma.student.count({ where: studentWhere });
      myStudentsCount += count;

      classSectionPairs.push({
        classId: assign.classId,
        sectionId: assign.sectionId,
        className: assign.class.name,
        sectionName: assign.section?.name,
      });
    }

    // Today's attendance calculation
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let todaysAttendanceCount = 0;
    let pendingAttendanceCount = 0;

    for (const pair of classSectionPairs) {
      const attWhere: any = {
        schoolId,
        classId: pair.classId,
        date: { gte: todayStart, lte: todayEnd },
      };
      if (pair.sectionId) {
        attWhere.OR = [{ sectionId: pair.sectionId }, { sectionId: null }];
      }

      const marked = await this.prisma.attendance.count({ where: attWhere });
      if (marked > 0) {
        todaysAttendanceCount += marked;
      } else {
        pendingAttendanceCount += 1;
      }
    }

    return {
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      employeeId: teacher.employeeId,
      myClassesCount,
      myStudentsCount,
      todaysAttendanceCount,
      pendingAttendanceCount,
    };
  }

  /**
   * GET /api/teacher/classes - My assigned classes
   */
  async getAssignedClasses(userId: string, schoolId: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);

    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id, schoolId },
      include: {
        class: true,
        section: true,
        academicYear: true,
      },
      orderBy: { class: { name: 'asc' } },
    });

    const result: any[] = [];
    for (const assign of assignments) {
      const studentWhere: any = { schoolId, classId: assign.classId, status: 'ACTIVE' };
      if (assign.sectionId) {
        studentWhere.OR = [{ sectionId: assign.sectionId }, { sectionId: null }];
      }

      const studentCount = await this.prisma.student.count({ where: studentWhere });

      result.push({
        id: assign.id,
        classId: assign.classId,
        sectionId: assign.sectionId,
        className: assign.class.name,
        sectionName: assign.section?.name || 'All Sections',
        subjectName: assign.subjectName,
        academicYear: assign.academicYear.name,
        studentCount,
      });
    }

    return result;
  }

  /**
   * GET /api/teacher/classes/:classId/students
   * Strips Aadhaar numbers, passwords, and tokens!
   */
  async getStudentsForClass(userId: string, schoolId: string, classId: string, sectionId?: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);
    await this.verifyTeacherAssignment(teacher.id, schoolId, classId, sectionId);

    const where: any = {
      schoolId,
      classId,
      status: 'ACTIVE',
    };

    if (sectionId) {
      where.OR = [{ sectionId: sectionId }, { sectionId: null }];
    }

    const students = await this.prisma.student.findMany({
      where,
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        gender: true,
        dateOfBirth: true,
        class: {
          select: { id: true, name: true },
        },
        section: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { rollNumber: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return students;
  }

  /**
   * GET /api/teacher/students/:studentId
   * Limited student profile with attendance stats (No Aadhaar exposed!)
   */
  async getStudentProfileForTeacher(userId: string, schoolId: string, studentId: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId },
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        gender: true,
        dateOfBirth: true,
        classId: true,
        sectionId: true,
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!student || !student.classId) {
      throw new NotFoundException('Student not found');
    }

    // Verify teacher assignment to this student's class
    await this.verifyTeacherAssignment(teacher.id, schoolId, student.classId, student.sectionId || undefined);

    // Calculate attendance statistics for this student
    const totalRecords = await this.prisma.attendance.count({ where: { studentId } });
    const presentCount = await this.prisma.attendance.count({ where: { studentId, status: 'PRESENT' } });
    const absentCount = await this.prisma.attendance.count({ where: { studentId, status: 'ABSENT' } });
    const lateCount = await this.prisma.attendance.count({ where: { studentId, status: 'LATE' } });

    const attendanceRate = totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 1000) / 10 : 100;

    return {
      student,
      attendanceStats: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate,
      },
    };
  }

  /**
   * GET /api/teacher/attendance
   * Fetch students and existing attendance for assigned class/section & date
   */
  async getAttendanceRecords(userId: string, schoolId: string, classId: string, sectionId?: string, dateStr?: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);
    await this.verifyTeacherAssignment(teacher.id, schoolId, classId, sectionId);

    const students = await this.getStudentsForClass(userId, schoolId, classId, sectionId);

    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const attWhere: any = {
      schoolId,
      classId,
      date: { gte: startOfDay, lte: endOfDay },
    };
    if (sectionId) {
      attWhere.OR = [{ sectionId: sectionId }, { sectionId: null }];
    }

    const existingAttendance = await this.prisma.attendance.findMany({
      where: attWhere,
    });

    const attendanceMap = new Map<string, any>();
    existingAttendance.forEach((att) => {
      attendanceMap.set(att.studentId, att);
    });

    const result = students.map((s) => {
      const existing = attendanceMap.get(s.id);
      return {
        studentId: s.id,
        admissionNumber: s.admissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        rollNumber: s.rollNumber,
        status: existing ? existing.status : 'PRESENT', // default Present
        remarks: existing ? existing.remarks : '',
        markedAt: existing ? existing.updatedAt : null,
      };
    });

    return {
      date: startOfDay.toISOString().split('T')[0],
      records: result,
    };
  }

  /**
   * POST /api/teacher/attendance/bulk
   * Record or update bulk attendance
   */
  async recordBulkAttendance(userId: string, schoolId: string, dto: SubmitAttendanceDto) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);
    await this.verifyTeacherAssignment(teacher.id, schoolId, dto.classId, dto.sectionId);

    const currentAcademicYear = await this.prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    const targetDate = new Date(dto.date);
    targetDate.setHours(0, 0, 0, 0);

    const operations = dto.records.map((record) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: record.studentId,
            date: targetDate,
          },
        },
        update: {
          status: record.status,
          remarks: record.remarks || null,
          markedBy: userId,
          academicYearId: currentAcademicYear?.id || null,
        },
        create: {
          schoolId,
          classId: dto.classId,
          sectionId: dto.sectionId || null,
          studentId: record.studentId,
          academicYearId: currentAcademicYear?.id || null,
          date: targetDate,
          status: record.status,
          remarks: record.remarks || null,
          markedBy: userId,
        },
      })
    );

    const results = await this.prisma.$transaction(operations);

    // Audit Log
    await this.auditService.log({
      schoolId,
      userId,
      action: 'ATTENDANCE_MARKED',
      entity: 'ATTENDANCE',
      details: {
        classId: dto.classId,
        sectionId: dto.sectionId,
        date: dto.date,
        totalSubmitted: dto.records.length,
        presentCount: dto.records.filter((r) => r.status === 'PRESENT').length,
        absentCount: dto.records.filter((r) => r.status === 'ABSTRACT').length,
      },
    });

    return {
      success: true,
      message: `Successfully saved attendance for ${results.length} students.`,
      count: results.length,
    };
  }

  /**
   * GET /api/teacher/attendance/history
   * Attendance history aggregated by date for assigned class/section
   */
  async getAttendanceHistory(userId: string, schoolId: string, classId: string, sectionId?: string, monthStr?: string) {
    const teacher = await this.getTeacherByUserId(userId, schoolId);
    await this.verifyTeacherAssignment(teacher.id, schoolId, classId, sectionId);

    const now = new Date();
    const year = monthStr ? parseInt(monthStr.split('-')[0], 10) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr.split('-')[1], 10) - 1 : now.getMonth();

    const startDate = new Date(year, month, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const attWhere: any = {
      schoolId,
      classId,
      date: { gte: startDate, lte: endDate },
    };
    if (sectionId) {
      attWhere.OR = [{ sectionId: sectionId }, { sectionId: null }];
    }

    const records = await this.prisma.attendance.findMany({
      where: attWhere,
      orderBy: { date: 'desc' },
    });

    // Group by date
    const dateMap = new Map<string, { present: number; absent: number; late: number; total: number }>();

    records.forEach((r) => {
      const dateKey = r.date.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { present: 0, absent: 0, late: 0, total: 0 });
      }
      const entry = dateMap.get(dateKey)!;
      entry.total += 1;
      if (r.status === 'PRESENT') entry.present += 1;
      else if (r.status === 'ABSENT') entry.absent += 1;
      else if (r.status === 'LATE') entry.late += 1;
    });

    const history = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      total: counts.total,
      percentage: counts.total > 0 ? Math.round(((counts.present + counts.late) / counts.total) * 1000) / 10 : 0,
    }));

    return history;
  }
}
