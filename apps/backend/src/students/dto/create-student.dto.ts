import { IsNotEmpty, IsString, IsEmail, IsOptional, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'ADM-2026-001', description: 'Admission Number' })
  @IsNotEmpty()
  @IsString()
  admissionNumber: string;

  @ApiProperty({ example: 'Alice', description: 'First Name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last Name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'alice.smith@school.com', description: 'Student Email' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'StudentPass123!', description: 'Login password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: 'Female', description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '2012-05-14', description: 'Date of Birth' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'Date of Admission' })
  @IsOptional()
  @IsString()
  admissionDate?: string;

  @ApiPropertyOptional({ description: 'Class ID' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ description: 'Section ID' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiPropertyOptional({ example: '101', description: 'Roll Number' })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({ example: '123456789012', description: 'Student Aadhaar Number (12 numeric digits)' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @Matches(/^\d{12}$/, { message: 'Student Aadhaar number must be exactly 12 numeric digits' })
  aadharNumber?: string;

  @ApiPropertyOptional({ example: 'Robert Smith', description: "Father's Name" })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional({ example: '123456789013', description: 'Father Aadhaar Number (12 numeric digits)' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @Matches(/^\d{12}$/, { message: 'Father Aadhaar number must be exactly 12 numeric digits' })
  fatherAadharNo?: string;

  @ApiPropertyOptional({ example: 'Mary Smith', description: "Mother's Name" })
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional({ example: '123456789014', description: 'Mother Aadhaar Number (12 numeric digits)' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @Matches(/^\d{12}$/, { message: 'Mother Aadhaar number must be exactly 12 numeric digits' })
  motherAadharNo?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Contact / Mobile Number (10 numeric digits)' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @Matches(/^\d{10}$/, { message: 'Contact / Mobile number must be exactly 10 numeric digits' })
  mobileNo?: string;

  @ApiPropertyOptional({ example: 'Robert Smith', description: 'Care Of Name' })
  @IsOptional()
  @IsString()
  careOfName?: string;

  // Legacy parent compatibility fields
  @ApiPropertyOptional({ example: 'Robert', description: 'Parent First Name' })
  @IsOptional()
  @IsString()
  parentFirstName?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'Parent Last Name' })
  @IsOptional()
  @IsString()
  parentLastName?: string;

  @ApiPropertyOptional({ example: 'Father', description: 'Relationship' })
  @IsOptional()
  @IsString()
  parentRelationship?: string;

  @ApiPropertyOptional({ example: '+1-555-0191', description: 'Parent Phone' })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'robert.smith@example.com', description: 'Parent Email' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsEmail()
  parentEmail?: string;
}
