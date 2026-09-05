import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.teacher.findMany({
      where: { schoolId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
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
      orderBy: { firstName: 'asc' },
    });
  }

  async createTeacher(schoolId: string, dto: CreateTeacherDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }],
      },
    });

    if (existingUser) {
      throw new ConflictException(`User with email '${dto.email}' already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          email: dto.email,
          username: dto.email.split('@')[0],
          passwordHash,
          role: 'TEACHER',
          status: 'ACTIVE',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          schoolId,
          userId: user.id,
          employeeId: dto.employeeId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          email: dto.email,
          qualification: dto.qualification,
          designation: dto.designation,
          joinedDate: new Date(),
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: { id: true, email: true, role: true, status: true },
          },
        },
      });

      return teacher;
    });
  }

  async findById(schoolId: string, id: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
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
      throw new NotFoundException(`Teacher with ID '${id}' not found`);
    }

    return teacher;
  }

  async assignTeacher(schoolId: string, dto: AssignTeacherDto) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: dto.teacherId, schoolId },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID '${dto.teacherId}' not found`);
    }

    return this.prisma.teacherAssignment.create({
      data: {
        schoolId,
        teacherId: dto.teacherId,
        classId: dto.classId,
        sectionId: dto.sectionId,
        subjectName: dto.subjectName,
        academicYearId: dto.academicYearId,
      },
      include: {
        teacher: true,
        class: true,
        section: true,
        academicYear: true,
      },
    });
  }

  async updateTeacher(schoolId: string, id: string, dto: any) {
    const teacher = await this.findById(schoolId, id);

    return this.prisma.teacher.update({
      where: { id: teacher.id },
      data: dto,
      include: {
        user: { select: { id: true, email: true, role: true } },
        teacherAssignments: { include: { class: true, section: true } },
      },
    });
  }

  async deleteTeacher(schoolId: string, id: string) {
    const teacher = await this.findById(schoolId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.teacher.delete({ where: { id: teacher.id } });
      await tx.user.delete({ where: { id: teacher.userId } });
      return { message: 'Teacher deleted successfully' };
    });
  }
}
