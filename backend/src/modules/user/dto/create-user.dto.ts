import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  USER = 'user',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'newuser',
    description: 'Username for the new account',
  })
  @IsNotEmpty({ message: 'El usuario es obligatorio.' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the new account',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email for the new account',
  })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString()
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STAFF,
    description: 'Role of the user (admin, staff, user)',
  })
  @IsEnum(UserRole, { message: 'El rol seleccionado no es válido.' })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
} 