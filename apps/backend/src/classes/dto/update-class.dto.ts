import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 'Grade 10', description: 'Class name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'G10', description: 'Class short code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Tenth grade secondary class', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}
