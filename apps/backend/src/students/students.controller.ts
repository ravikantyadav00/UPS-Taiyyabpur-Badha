import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all students with filters' })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAll(user.schoolId, classId, sectionId, search);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Enroll a new student' })
  async createStudent(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(user.schoolId, dto);
  }

  @Post('bulk')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk enroll students from Excel' })
  async bulkImportStudents(@CurrentUser() user: AuthenticatedUser, @Body() dtos: CreateStudentDto[]) {
    return this.studentsService.bulkImportStudents(user.schoolId, dtos);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get student profile details by ID' })
  async findById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.studentsService.findById(user.schoolId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update student profile details' })
  async updateStudent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.updateStudent(user.schoolId, id, dto);
  }

  @Delete('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete all students in school (or filtered class/section)' })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  async deleteAllStudents(
    @CurrentUser() user: AuthenticatedUser,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.studentsService.deleteAllStudents(user.schoolId, classId, sectionId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete student profile and account' })
  async deleteStudent(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.studentsService.deleteStudent(user.schoolId, id);
  }
}

