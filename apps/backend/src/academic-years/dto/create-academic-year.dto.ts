import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2026-2027', description: 'Academic year display name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z', description: 'Academic year start date' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-06-30T00:00:00.000Z', description: 'Academic year end date' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: false, description: 'Set as current active academic year' })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
