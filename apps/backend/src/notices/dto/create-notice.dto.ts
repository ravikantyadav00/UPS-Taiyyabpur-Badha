import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: 'वार्षिक परीक्षा समय सारणी' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'ACADEMIC' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'सभी कक्षाओं के लिए वार्षिक परीक्षाएं प्रारंभ हो रही हैं।' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: '2026-09-20' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
