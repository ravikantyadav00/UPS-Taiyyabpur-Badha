import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TimetablesService } from './timetables.service';
import { CreateTimetablePeriodDto } from './dto/create-timetable.dto';

@ApiTags('Timetables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('timetables')
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get class timetable schedule' })
  async findByClass(
    @CurrentUser('schoolId') schoolId: string,
    @Query('classId') classId: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.timetablesService.findByClass(schoolId, classId, sectionId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create timetable schedule slot' })
  async createPeriod(@CurrentUser('schoolId') schoolId: string, @Body() dto: CreateTimetablePeriodDto) {
    return this.timetablesService.createPeriod(schoolId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete timetable schedule slot' })
  async deletePeriod(@CurrentUser('schoolId') schoolId: string, @Param('id') id: string) {
    return this.timetablesService.deletePeriod(schoolId, id);
  }
}
