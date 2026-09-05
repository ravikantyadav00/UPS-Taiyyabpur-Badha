import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export class CreateTimetablePeriodDto {
  @ApiProperty({ description: 'Class ID' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiPropertyOptional({ description: 'Section ID' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Teacher ID' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ enum: DayOfWeek, example: 'MONDAY' })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '08:30', description: 'Start Time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '09:30', description: 'End Time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'Mathematics', description: 'Subject Name' })
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @ApiPropertyOptional({ example: 'Room 201', description: 'Room Number' })
  @IsOptional()
  @IsString()
  roomNumber?: string;
}
