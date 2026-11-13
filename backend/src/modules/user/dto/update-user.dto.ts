import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({
    example: 'updateduser',
    description: 'Username for the account',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password for the account',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password?: string;

  @ApiProperty({
    example: 'updated@example.com',
    description: 'Email for the account',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  email?: string;

  @ApiProperty({
    example: 'Updated Name',
    description: 'Full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Role of the user (admin, staff, user)',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol seleccionado no es válido.' })
  role?: UserRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
} 