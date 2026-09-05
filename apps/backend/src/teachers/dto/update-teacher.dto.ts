import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeacherDto {
  @ApiPropertyOptional({ example: 'John', description: 'First Name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last Name' })
  @IsOptional()
  @IsString()
  lastName?: string;

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
