import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get('me')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get current school profile (Admin only)' })
  @SwaggerResponse({ status: 200, description: 'School profile returned successfully' })
  async getMySchool(@CurrentUser() user: AuthenticatedUser) {
    return this.schoolsService.findSchoolById(user.schoolId);
  }

  @Patch('me')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update current school profile (Admin only)' })
  @SwaggerResponse({ status: 200, description: 'School profile updated successfully' })
  async updateMySchool(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.updateSchool(user.schoolId, dto);
  }
}
