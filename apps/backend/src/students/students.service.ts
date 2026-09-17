import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';


@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string, classId?: string, sectionId?: string, search?: string) {
    const where: any = { schoolId };

    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { admissionNumber: { contains: search } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: {
        class: true,
        section: true,
        user: {
          select: { id: true, email: true, username: true, status: true },
        },
        studentParents: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async createStudent(schoolId: string, dto: CreateStudentDto) {
    const existingStudent = await this.prisma.student.findFirst({
      where: { schoolId, admissionNumber: dto.admissionNumber },
    });

    if (existingStudent) {
      throw new ConflictException(`Student with admission number '${dto.admissionNumber}' already exists`);
    }

    const studentEmail = dto.email || `${dto.admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.com`;
    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create User account
      const user = await tx.user.create({
        data: {
          schoolId,
          email: studentEmail,
          username: dto.admissionNumber,
          passwordHash,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });

      // 2. Create Student record
      const student = await tx.student.create({
        data: {
          schoolId,
          userId: user.id,
          admissionNumber: dto.admissionNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
          classId: dto.classId,
          sectionId: dto.sectionId,
          rollNumber: dto.rollNumber,
          aadharNumber: dto.aadharNumber,
          fatherName: dto.fatherName,
          fatherAadharNo: dto.fatherAadharNo,
          motherName: dto.motherName,
          motherAadharNo: dto.motherAadharNo,
          mobileNo: dto.mobileNo,
          careOfName: dto.careOfName,
          status: 'ACTIVE',
        },
      });

      // 3. Create Parent record if parent info provided
      if (dto.parentFirstName && dto.parentLastName) {
        const parent = await tx.parent.create({
          data: {
            schoolId,
            firstName: dto.parentFirstName,
            lastName: dto.parentLastName,
            relationship: dto.parentRelationship || 'Parent',
            phone: dto.parentPhone,
            email: dto.parentEmail,
          },
        });

        await tx.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            isPrimaryContact: true,
          },
        });
      }

      return tx.student.findUnique({
        where: { id: student.id },
        include: {
          class: true,
          section: true,
          user: { select: { id: true, email: true, username: true } },
          studentParents: { include: { parent: true } },
        },
      });
    });
  }

  async findById(schoolId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        class: true,
        section: true,
        user: true,
        studentParents: { include: { parent: true } },
        academicRecords: { include: { class: true, academicYear: true } },
        documents: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID '${id}' not found`);
    }

    return student;
  }

  async updateStudent(schoolId: string, id: string, dto: UpdateStudentDto) {
    const student = await this.findById(schoolId, id);

    const studentData: any = {};
    if (dto.admissionNumber !== undefined && dto.admissionNumber.trim() !== student.admissionNumber) {
      const existing = await this.prisma.student.findFirst({
        where: { schoolId, admissionNumber: dto.admissionNumber.trim(), NOT: { id: student.id } },
      });
      if (existing) {
        throw new ConflictException(`Student with admission number '${dto.admissionNumber}' already exists`);
      }
      studentData.admissionNumber = dto.admissionNumber.trim();
    }

    if (dto.firstName !== undefined) studentData.firstName = dto.firstName;
    if (dto.lastName !== undefined) studentData.lastName = dto.lastName;
    if (dto.gender !== undefined) studentData.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) studentData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.admissionDate !== undefined) studentData.admissionDate = dto.admissionDate ? new Date(dto.admissionDate) : null;
    if (dto.classId !== undefined) studentData.classId = dto.classId;
    if (dto.sectionId !== undefined) studentData.sectionId = dto.sectionId;
    if (dto.rollNumber !== undefined) studentData.rollNumber = dto.rollNumber;
    if (dto.aadharNumber !== undefined) studentData.aadharNumber = dto.aadharNumber;
    if (dto.fatherName !== undefined) studentData.fatherName = dto.fatherName;
    if (dto.fatherAadharNo !== undefined) studentData.fatherAadharNo = dto.fatherAadharNo;
    if (dto.motherName !== undefined) studentData.motherName = dto.motherName;
    if (dto.motherAadharNo !== undefined) studentData.motherAadharNo = dto.motherAadharNo;
    if (dto.mobileNo !== undefined) studentData.mobileNo = dto.mobileNo;
    if (dto.careOfName !== undefined) studentData.careOfName = dto.careOfName;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Student record if there are fields to update
      if (Object.keys(studentData).length > 0) {
        await tx.student.update({
          where: { id: student.id },
          data: studentData,
        });

        if (studentData.admissionNumber) {
          await tx.user.update({
            where: { id: student.userId },
            data: { username: studentData.admissionNumber },
          });
        }
      }

      // 2. Handle Parent update / creation
      const primaryParentLink = student.studentParents?.[0];
      if (primaryParentLink?.parent) {
        const parentData: any = {};
        if (dto.parentFirstName !== undefined) parentData.firstName = dto.parentFirstName;
        if (dto.parentLastName !== undefined) parentData.lastName = dto.parentLastName;
        if (dto.parentRelationship !== undefined) parentData.relationship = dto.parentRelationship;
        if (dto.parentPhone !== undefined) parentData.phone = dto.parentPhone;
        if (dto.parentEmail !== undefined) parentData.email = dto.parentEmail;

        if (Object.keys(parentData).length > 0) {
          await tx.parent.update({
            where: { id: primaryParentLink.parent.id },
            data: parentData,
          });
        }
      } else if (dto.parentFirstName && dto.parentLastName) {
        const parent = await tx.parent.create({
          data: {
            schoolId,
            firstName: dto.parentFirstName,
            lastName: dto.parentLastName,
            relationship: dto.parentRelationship || 'Parent',
            phone: dto.parentPhone,
            email: dto.parentEmail,
          },
        });

        await tx.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            isPrimaryContact: true,
          },
        });
      }

      return tx.student.findUnique({
        where: { id: student.id },
        include: {
          class: true,
          section: true,
          user: { select: { id: true, email: true, username: true } },
          studentParents: { include: { parent: true } },
        },
      });
    });
  }

  async deleteStudent(schoolId: string, id: string) {
    const student = await this.findById(schoolId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id: student.id } });
      await tx.user.delete({ where: { id: student.userId } });
      return { message: 'Student deleted successfully' };
    });
  }

  async deleteAllStudents(schoolId: string, classId?: string, sectionId?: string) {
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;

    const students = await this.prisma.student.findMany({
      where,
      select: { id: true, userId: true },
    });

    if (students.length === 0) {
      return { count: 0, message: 'No students found to delete' };
    }

    const studentIds = students.map((s) => s.id);
    const userIds = students.map((s) => s.userId).filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      await tx.student.deleteMany({
        where: { id: { in: studentIds } },
      });
      if (userIds.length > 0) {
        await tx.user.deleteMany({
          where: { id: { in: userIds } },
        });
      }
    });

    return { count: studentIds.length, message: `Successfully deleted ${studentIds.length} student(s)` };
  }


  async bulkImportStudents(schoolId: string, dtos: CreateStudentDto[]) {
    let successCount = 0;
    let failureCount = 0;
    const errors: { row: number; admissionNumber: string; error: string }[] = [];

    for (let i = 0; i < dtos.length; i++) {
      const dto = dtos[i];
      try {
        if (!dto.password) {
          dto.password = 'StudentPass123!';
        }
        await this.createStudent(schoolId, dto);
        successCount++;
      } catch (err: any) {
        failureCount++;
        errors.push({
          row: i + 1,
          admissionNumber: dto.admissionNumber || 'N/A',
          error: err.message || 'Failed to import student',
        });
      }
    }

    return {
      total: dtos.length,
      successCount,
      failureCount,
      errors,
    };
  }
}

