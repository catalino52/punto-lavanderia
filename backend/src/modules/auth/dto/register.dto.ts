import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'El usuario es obligatorio.' })
  @IsString({ message: 'El usuario debe ser un texto.' })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password untuk akun baru',
    required: true,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nama lengkap pengguna',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser un texto.' })
  name: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role pengguna (admin, staff, manager)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser un texto.' })
  role?: string;
} 