import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username untuk login',
  })
  @IsNotEmpty({ message: 'El usuario es obligatorio.' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Password untuk login',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString()
  password: string;
} 