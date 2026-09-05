import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export class StudentAttendanceItemDto {
  @ApiProperty({ description: 'Student ID' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, example: 'PRESENT' })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ description: 'Class ID' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiPropertyOptional({ description: 'Section ID' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty({ example: '2026-09-04', description: 'Attendance Date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ type: [StudentAttendanceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceItemDto)
  records: StudentAttendanceItemDto[];
}
