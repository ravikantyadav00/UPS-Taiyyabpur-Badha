import { IsNotEmpty, IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher@school.com', description: 'Teacher email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'TeacherPass123!', description: 'Teacher login password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'EMP-101', description: 'Employee ID' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '+1-555-0188', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'M.Sc. Mathematics', description: 'Qualification' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional({ example: 'Senior Math Teacher', description: 'Designation' })
  @IsOptional()
  @IsString()
  designation?: string;
}
