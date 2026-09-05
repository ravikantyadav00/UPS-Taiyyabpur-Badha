import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all teachers for the current school' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.teachersService.findAll(user.schoolId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create teacher user account and profile' })
  async createTeacher(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTeacherDto) {
    return this.teachersService.createTeacher(user.schoolId, dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get teacher by ID' })
  async findById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.teachersService.findById(user.schoolId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update teacher profile details' })
  async updateTeacher(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.updateTeacher(user.schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete teacher profile and account' })
  async deleteTeacher(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.teachersService.deleteTeacher(user.schoolId, id);
  }

  @Post('assign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign teacher to class, section, and subject' })
  async assignTeacher(@CurrentUser() user: AuthenticatedUser, @Body() dto: AssignTeacherDto) {
    return this.teachersService.assignTeacher(user.schoolId, dto);
  }
}
