import { IsNotEmpty, IsString, IsOptional, IsDateString, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Mid-Term 2026', description: 'Exam title' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Mid-Term', description: 'Term name' })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiProperty({ description: 'Academic Year ID' })
  @IsNotEmpty()
  @IsString()
  academicYearId: string;

  @ApiProperty({ example: '2026-10-01', description: 'Start Date' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-15', description: 'End Date' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class CreateExamSubjectDto {
  @ApiProperty({ description: 'Class ID' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty({ example: 'Mathematics', description: 'Subject Name' })
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @ApiProperty({ example: 100, description: 'Maximum Marks' })
  @IsNumber()
  @Min(1)
  maxMarks: number;

  @ApiProperty({ example: 35, description: 'Pass Marks' })
  @IsNumber()
  @Min(0)
  passMarks: number;

  @ApiPropertyOptional({ example: '2026-10-02', description: 'Exam Date' })
  @IsOptional()
  @IsDateString()
  examDate?: string;
}

export class StudentMarkItemDto {
  @ApiProperty({ description: 'Student ID' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ example: 88.5, description: 'Marks obtained' })
  @IsNumber()
  @Min(0)
  marksObtained: number;

  @ApiPropertyOptional({ example: 'Very Good', description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class RecordMarksDto {
  @ApiProperty({ description: 'Exam Subject ID' })
  @IsNotEmpty()
  @IsString()
  examSubjectId: string;

  @ApiProperty({ type: [StudentMarkItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentMarkItemDto)
  marks: StudentMarkItemDto[];
}
