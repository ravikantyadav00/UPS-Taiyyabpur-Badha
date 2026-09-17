import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Public Holidays')
@Controller('public/holidays')
export class PublicHolidaysController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get public upcoming holidays for school website' })
  async getPublicHolidays() {
    return this.prisma.holiday.findMany({
      where: {
        endDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { startDate: 'asc' },
      take: 6,
    });
  }
}
