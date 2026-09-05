import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address, username, or mobile number',
    example: 'admin@school.com',
  })
  @IsNotEmpty({ message: 'Identifier (email, mobile, or username) is required' })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'User account password',
    example: 'AdminSecret123!',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
