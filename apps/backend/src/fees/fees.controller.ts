import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SchoolIsolationGuard } from '../common/guards/school-isolation.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FeesService } from './fees.service';
import { CreateFeeStructureDto, GenerateInvoicesDto, RecordPaymentDto } from './dto/create-fee.dto';

@ApiTags('Fees & Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SchoolIsolationGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('structures')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List fee structures' })
  async findStructures(@CurrentUser('schoolId') schoolId: string) {
    return this.feesService.findStructures(schoolId);
  }

  @Post('structures')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create fee structure' })
  async createStructure(@CurrentUser('schoolId') schoolId: string, @Body() dto: CreateFeeStructureDto) {
    return this.feesService.createStructure(schoolId, dto);
  }

  @Post('invoices/generate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Batch generate fee invoices for students' })
  async generateInvoices(@CurrentUser('schoolId') schoolId: string, @Body() dto: GenerateInvoicesDto) {
    return this.feesService.generateInvoices(schoolId, dto);
  }

  @Get('invoices')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List fee invoices' })
  async findInvoices(
    @CurrentUser('schoolId') schoolId: string,
    @Query('status') status?: string,
    @Query('classId') classId?: string,
  ) {
    return this.feesService.findInvoices(schoolId, status, classId);
  }

  @Post('payments')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Record student fee payment' })
  async recordPayment(@CurrentUser('schoolId') schoolId: string, @Body() dto: RecordPaymentDto) {
    return this.feesService.recordPayment(schoolId, dto);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get fee collection & dues financial statistics' })
  async getFinancialStats(@CurrentUser('schoolId') schoolId: string) {
    return this.feesService.getFinancialStats(schoolId);
  }
}
