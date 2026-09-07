import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@ApiTags('Holidays')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get all declared holidays' })
  async findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.holidaysService.findAll(schoolId);
  }

  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get holiday by ID' })
  async findOne(@CurrentUser('schoolId') schoolId: string, @Param('id') id: string) {
    return this.holidaysService.findOne(schoolId, id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new holiday' })
  async create(@CurrentUser('schoolId') schoolId: string, @Body() dto: CreateHolidayDto) {
    return this.holidaysService.create(schoolId, dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update holiday' })
  async update(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.holidaysService.update(schoolId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete holiday' })
  async remove(@CurrentUser('schoolId') schoolId: string, @Param('id') id: string) {
    return this.holidaysService.remove(schoolId, id);
  }
}
