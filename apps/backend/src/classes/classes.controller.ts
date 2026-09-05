import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Classes & Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all classes with section and student counts' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.classesService.findAll(user.schoolId);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new class' })
  async createClass(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClassDto) {
    return this.classesService.createClass(user.schoolId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a class' })
  async updateClass(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.updateClass(user.schoolId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a class' })
  async removeClass(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.classesService.removeClass(user.schoolId, id);
  }

  @Post(':classId/sections')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add a section to a class' })
  async createSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('classId') classId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.classesService.createSection(user.schoolId, classId, dto);
  }

  @Get(':classId/sections')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all sections for a class' })
  async findSections(@CurrentUser() user: AuthenticatedUser, @Param('classId') classId: string) {
    return this.classesService.findSections(user.schoolId, classId);
  }

  @Patch('sections/:sectionId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a section' })
  async updateSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.classesService.updateSection(user.schoolId, sectionId, dto);
  }

  @Delete('sections/:sectionId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a section' })
  async removeSection(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sectionId') sectionId: string,
  ) {
    return this.classesService.removeSection(user.schoolId, sectionId);
  }
}

