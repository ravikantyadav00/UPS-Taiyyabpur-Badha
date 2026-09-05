import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/create-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get daily attendance list for a class section' })
  async getAttendance(
    @CurrentUser('schoolId') schoolId: string,
    @Query('classId') classId: string,
    @Query('sectionId') sectionId?: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByClassAndDate(schoolId, classId, sectionId, date);
  }

  @Post('bulk')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Submit bulk attendance for a class section' })
  async recordBulkAttendance(
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: BulkAttendanceDto,
  ) {
    return this.attendanceService.recordBulkAttendance(schoolId, dto);
  }

  @Get('summary')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get attendance percentage summary' })
  async getSummary(
    @CurrentUser('schoolId') schoolId: string,
    @Query('classId') classId?: string,
  ) {
    return this.attendanceService.getSummary(schoolId, classId);
  }
}
