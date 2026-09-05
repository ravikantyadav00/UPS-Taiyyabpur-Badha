import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeStructureDto {
  @ApiProperty({ description: 'Academic Year ID' })
  @IsNotEmpty()
  @IsString()
  academicYearId: string;

  @ApiPropertyOptional({ description: 'Class ID (leave blank for all classes)' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ example: 'Tuition Fee - Q1 2026', description: 'Fee structure title' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 1500.0, description: 'Fee Amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2026-09-30', description: 'Due Date' })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class GenerateInvoicesDto {
  @ApiProperty({ description: 'Fee Structure ID' })
  @IsNotEmpty()
  @IsString()
  feeStructureId: string;

  @ApiPropertyOptional({ description: 'Class ID to target' })
  @IsOptional()
  @IsString()
  classId?: string;
}

export class RecordPaymentDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsNotEmpty()
  @IsString()
  invoiceId: string;

  @ApiProperty({ example: 1500.0, description: 'Amount Paid' })
  @IsNumber()
  @Min(1)
  amountPaid: number;

  @ApiProperty({ example: 'CASH', description: 'Payment Method (CASH, ONLINE, CHEQUE, BANK_TRANSFER)' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'TXN-998811', description: 'Transaction Ref / Cheque No' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
