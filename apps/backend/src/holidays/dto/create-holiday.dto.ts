import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum HolidayType {
  OFFICIAL = 'OFFICIAL',
  FESTIVAL = 'FESTIVAL',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

export class CreateHolidayDto {
  @ApiProperty({ example: 'Diwali Festival' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Festival of Lights' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-11-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-11-03' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: HolidayType, default: HolidayType.OFFICIAL })
  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academicYearId?: string;
}
