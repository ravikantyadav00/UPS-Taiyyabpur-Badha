import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.academicYear.findMany({
      where: { schoolId },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(schoolId: string, dto: CreateAcademicYearDto) {
    if (dto.isCurrent) {
      // Reset any existing current academic year
      await this.prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return this.prisma.academicYear.create({
      data: {
        schoolId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isCurrent: dto.isCurrent || false,
      },
    });
  }

  async setCurrent(schoolId: string, id: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic Year with ID '${id}' not found`);
    }

    await this.prisma.academicYear.updateMany({
      where: { schoolId, isCurrent: true },
      data: { isCurrent: false },
    });

    return this.prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });
  }

  async remove(schoolId: string, id: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { id, schoolId },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic Year with ID '${id}' not found`);
    }

    return this.prisma.academicYear.delete({
      where: { id },
    });
  }
}
