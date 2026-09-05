import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all academic years for the current school' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.academicYearsService.findAll(user.schoolId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new academic year' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAcademicYearDto) {
    return this.academicYearsService.create(user.schoolId, dto);
  }

  @Patch(':id/set-current')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Set an academic year as the active current year' })
  async setCurrent(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.academicYearsService.setCurrent(user.schoolId, id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an academic year' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.academicYearsService.remove(user.schoolId, id);
  }
}
