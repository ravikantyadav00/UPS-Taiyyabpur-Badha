import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@ApiTags('Notices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get all notices for the school' })
  async findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.noticesService.findAll(schoolId);
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get notice by ID' })
  async findOne(@CurrentUser('schoolId') schoolId: string, @Param('id') id: string) {
    return this.noticesService.findOne(schoolId, id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new notice' })
  async create(@CurrentUser('schoolId') schoolId: string, @Body() dto: CreateNoticeDto) {
    return this.noticesService.create(schoolId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update notice' })
  async update(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.noticesService.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete notice' })
  async remove(@CurrentUser('schoolId') schoolId: string, @Param('id') id: string) {
    return this.noticesService.remove(schoolId, id);
  }
}
