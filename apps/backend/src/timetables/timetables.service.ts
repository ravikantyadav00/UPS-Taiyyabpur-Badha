import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTimetablePeriodDto } from './dto/create-timetable.dto';

@Injectable()
export class TimetablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClass(schoolId: string, classId: string, sectionId?: string) {
    const where: any = { schoolId, classId };
    if (sectionId) where.sectionId = sectionId;

    return this.prisma.timetablePeriod.findMany({
      where,
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true },
        },
        class: true,
        section: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createPeriod(schoolId: string, dto: CreateTimetablePeriodDto) {
    return this.prisma.timetablePeriod.create({
      data: {
        schoolId,
        classId: dto.classId,
        sectionId: dto.sectionId || null,
        teacherId: dto.teacherId || null,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        subjectName: dto.subjectName,
        roomNumber: dto.roomNumber,
      },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        class: true,
        section: true,
      },
    });
  }

  async deletePeriod(schoolId: string, id: string) {
    const period = await this.prisma.timetablePeriod.findFirst({
      where: { id, schoolId },
    });

    if (!period) {
      throw new NotFoundException(`Timetable period not found`);
    }

    await this.prisma.timetablePeriod.delete({ where: { id } });
    return { message: 'Period removed successfully' };
  }
}
