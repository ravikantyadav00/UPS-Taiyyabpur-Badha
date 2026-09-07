import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.holiday.findMany({
      where: { schoolId },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, schoolId },
    });
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }
    return holiday;
  }

  async create(schoolId: string, dto: CreateHolidayDto) {
    const start = new Date(dto.startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(dto.endDate);
    end.setUTCHours(23, 59, 59, 999);

    if (end < start) {
      throw new BadRequestException('End date cannot be before start date');
    }

    return this.prisma.holiday.create({
      data: {
        schoolId,
        title: dto.title,
        description: dto.description,
        startDate: start,
        endDate: end,
        type: dto.type || 'OFFICIAL',
        academicYearId: dto.academicYearId || null,
      },
    });
  }

  async update(schoolId: string, id: string, dto: UpdateHolidayDto) {
    await this.findOne(schoolId, id);

    const dataToUpdate: any = { ...dto };
    if (dto.startDate) {
      const start = new Date(dto.startDate);
      start.setUTCHours(0, 0, 0, 0);
      dataToUpdate.startDate = start;
    }
    if (dto.endDate) {
      const end = new Date(dto.endDate);
      end.setUTCHours(23, 59, 59, 999);
      dataToUpdate.endDate = end;
    }

    return this.prisma.holiday.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    return this.prisma.holiday.delete({
      where: { id },
    });
  }

  /**
   * Helper function to check if a specific date is a holiday for the given school.
   */
  async getHolidayForDate(schoolId: string, dateStrOrObj: string | Date) {
    const targetDate = new Date(dateStrOrObj);
    
    // Find any holiday where targetDate falls between startDate and endDate
    const holiday = await this.prisma.holiday.findFirst({
      where: {
        schoolId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (holiday) {
      return { isHoliday: true, holiday };
    }

    return { isHoliday: false, holiday: null };
  }
}
