import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSchoolDto {
  @ApiPropertyOptional({ example: 'Greenwood High School', description: 'School name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '123 Education Lane', description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+1-555-0199', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@school.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://school.com', description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Dr. Eleanor Vance', description: 'Principal Name' })
  @IsOptional()
  @IsString()
  principalName?: string;
}
