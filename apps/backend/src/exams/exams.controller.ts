import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExamsService } from './exams.service';
import { CreateExamDto, CreateExamSubjectDto, RecordMarksDto } from './dto/create-exam.dto';

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'List all exams' })
  async findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.examsService.findAll(schoolId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new exam term' })
  async createExam(@CurrentUser('schoolId') schoolId: string, @Body() dto: CreateExamDto) {
    return this.examsService.createExam(schoolId, dto);
  }

  @Post(':id/subjects')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Add subject paper to exam' })
  async addExamSubject(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id') examId: string,
    @Body() dto: CreateExamSubjectDto,
  ) {
    return this.examsService.addExamSubject(schoolId, examId, dto);
  }

  @Post('marks')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Record student marks' })
  async recordMarks(@CurrentUser('schoolId') schoolId: string, @Body() dto: RecordMarksDto) {
    return this.examsService.recordMarks(schoolId, dto);
  }

  @Get('report-card/:studentId')
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get student report card summary' })
  async getStudentReportCard(
    @CurrentUser('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.examsService.getStudentReportCard(schoolId, studentId);
  }
}
