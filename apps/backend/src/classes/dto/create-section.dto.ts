import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'Section A', description: 'Section name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Room 302', description: 'Classroom number' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ example: 40, description: 'Student capacity limit' })
  @IsOptional()
  @IsInt()
  capacity?: number;
}
