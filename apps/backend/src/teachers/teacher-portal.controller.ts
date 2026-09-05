import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { TeacherPortalService, SubmitAttendanceDto } from './teacher-portal.service';

@ApiTags('Teacher Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Roles(Role.TEACHER)
@Controller('teacher')
export class TeacherPortalController {
  constructor(private readonly teacherPortalService: TeacherPortalService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current teacher profile details' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.teacherPortalService.getProfile(user.id, user.schoolId);
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Get teacher dashboard summary metrics' })
  async getDashboardSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.teacherPortalService.getDashboardSummary(user.id, user.schoolId);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Get list of classes assigned to current teacher' })
  async getAssignedClasses(@CurrentUser() user: AuthenticatedUser) {
    return this.teacherPortalService.getAssignedClasses(user.id, user.schoolId);
  }

  @Get('classes/:classId/students')
  @ApiOperation({ summary: 'Get students in an assigned class (non-sensitive info only)' })
  async getStudentsForClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('classId') classId: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.teacherPortalService.getStudentsForClass(user.id, user.schoolId, classId, sectionId);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get limited student profile and attendance statistics' })
  async getStudentProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('studentId') studentId: string,
  ) {
    return this.teacherPortalService.getStudentProfileForTeacher(user.id, user.schoolId, studentId);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance records for assigned class, section and date' })
  async getAttendanceRecords(
    @CurrentUser() user: AuthenticatedUser,
    @Query('classId') classId: string,
    @Query('sectionId') sectionId?: string,
    @Query('date') date?: string,
  ) {
    return this.teacherPortalService.getAttendanceRecords(user.id, user.schoolId, classId, sectionId, date);
  }

  @Post('attendance/bulk')
  @ApiOperation({ summary: 'Submit or edit bulk attendance for assigned class section' })
  async recordBulkAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitAttendanceDto,
  ) {
    return this.teacherPortalService.recordBulkAttendance(user.id, user.schoolId, dto);
  }

  @Get('attendance/history')
  @ApiOperation({ summary: 'Get monthly attendance history for assigned class section' })
  async getAttendanceHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('classId') classId: string,
    @Query('sectionId') sectionId?: string,
    @Query('month') month?: string,
  ) {
    return this.teacherPortalService.getAttendanceHistory(user.id, user.schoolId, classId, sectionId, month);
  }
}
