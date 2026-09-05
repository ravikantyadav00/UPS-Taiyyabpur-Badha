import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignTeacherDto {
  @ApiProperty({ description: 'Teacher ID' })
  @IsNotEmpty()
  @IsString()
  teacherId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiPropertyOptional({ description: 'Section ID' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty({ example: 'Mathematics', description: 'Subject Name' })
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @ApiProperty({ description: 'Academic Year ID' })
  @IsNotEmpty()
  @IsString()
  academicYearId: string;
}
