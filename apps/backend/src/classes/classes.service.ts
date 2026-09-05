import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      include: {
        sections: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            students: true,
            sections: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createClass(schoolId: string, dto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        schoolId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
      },
    });
  }

  async updateClass(schoolId: string, classId: string, dto: UpdateClassDto) {
    const existing = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!existing) {
      throw new NotFoundException(`Class with ID '${classId}' not found`);
    }

    return this.prisma.class.update({
      where: { id: classId },
      data: dto,
    });
  }

  async removeClass(schoolId: string, classId: string) {
    const existing = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!existing) {
      throw new NotFoundException(`Class with ID '${classId}' not found`);
    }

    return this.prisma.class.delete({
      where: { id: classId },
    });
  }

  async createSection(schoolId: string, classId: string, dto: CreateSectionDto) {
    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!classRecord) {
      throw new NotFoundException(`Class with ID '${classId}' not found`);
    }

    return this.prisma.section.create({
      data: {
        schoolId,
        classId,
        name: dto.name,
        roomNumber: dto.roomNumber,
        capacity: dto.capacity,
      },
    });
  }

  async updateSection(schoolId: string, sectionId: string, dto: UpdateSectionDto) {
    const existing = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId },
    });

    if (!existing) {
      throw new NotFoundException(`Section with ID '${sectionId}' not found`);
    }

    return this.prisma.section.update({
      where: { id: sectionId },
      data: dto,
    });
  }

  async removeSection(schoolId: string, sectionId: string) {
    const existing = await this.prisma.section.findFirst({
      where: { id: sectionId, schoolId },
    });

    if (!existing) {
      throw new NotFoundException(`Section with ID '${sectionId}' not found`);
    }

    return this.prisma.section.delete({
      where: { id: sectionId },
    });
  }

  async findSections(schoolId: string, classId: string) {
    return this.prisma.section.findMany({
      where: { schoolId, classId },
      orderBy: { name: 'asc' },
    });
  }
}

