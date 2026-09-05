import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findSchoolById(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
            classes: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException(`School with ID '${schoolId}' not found`);
    }

    return school;
  }

  async updateSchool(schoolId: string, dto: UpdateSchoolDto) {
    await this.findSchoolById(schoolId);

    return this.prisma.school.update({
      where: { id: schoolId },
      data: dto,
      include: {
        _count: {
          select: {
            users: true,
            teachers: true,
            students: true,
            classes: true,
          },
        },
      },
    });
  }
}
