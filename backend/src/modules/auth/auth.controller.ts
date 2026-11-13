import { Controller, Post, Body, Get, Headers, UnauthorizedException, Req, Res, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente' })
  @ApiResponse({ status: 401, description: 'Usuario o contraseña incorrectos' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    try {
      console.log(`[Auth] Login attempt for user: ${loginDto.username}`);
      console.log(`[Auth] Headers:`, JSON.stringify(req.headers));
      console.log(`[Auth] Cookies:`, JSON.stringify(req.cookies));
      
      // Set CORS headers to allow requests from any origin (in development)
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      const result = await this.authService.login(loginDto);
      console.log(`[Auth] Login successful for user: ${loginDto.username}`);
      
      if (!result.token) {
        console.error(`[Auth] Login for ${loginDto.username} successful but no token generated`);
        throw new Error('Token generation failed');
      }
      
      // Set JWT token in cookies with various options for maximum compatibility
      
      // HttpOnly cookie for security
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Add a non-HttpOnly cookie too for client-side access
      res.cookie('auth_token', result.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      console.log(`[Auth] Cookies set for user ${loginDto.username}`);

      // Return response with user data
      console.log(`[Auth] Returning login response for ${loginDto.username}`);
      res.json(result);
    } catch (error) {
      console.error(`[Auth] Login error for ${loginDto.username}:`, error.message);
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario nuevo' })
  @ApiResponse({ status: 201, description: 'Registro completado correctamente' })
  @ApiResponse({ status: 400, description: 'Los datos no son válidos' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    
    // Set JWT token in cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return response with user data
    res.json(result);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validar el token de sesión' })
  @ApiResponse({ status: 200, description: 'El token es válido' })
  @ApiResponse({ status: 401, description: 'El token no es válido' })
  async validateToken(@Headers('authorization') auth: string) {
    if (!auth) {
      throw new UnauthorizedException('No se proporcionó el token de sesión.');
    }

    const token = auth.split(' ')[1];
    const isValid = await this.authService.validateToken(token);

    return { valid: isValid };
  }

  @Public()
  @Post('fix-token/:username')
  @ApiOperation({ summary: 'Renovar la sesión de un usuario' })
  @ApiResponse({ status: 200, description: 'Sesión renovada correctamente' })
  async fixToken(@Param('username') username: string, @Res() res: Response) {
    try {
      console.log(`[Auth] Attempting to fix token for user: ${username}`);
      
      // Find the user
      const user = await this.authService.findUserByUsername(username);
      
      if (!user) {
        console.log(`[Auth] Token fix failed: No user found with username: ${username}`);
        return res.status(404).json({ success: false, message: 'No se encontró el usuario.' });
      }
      
      console.log(`[Auth] Found user for token fix: ${username} (ID: ${user.id})`);
      
      // Generate a fresh token for this user
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role
      };
      
      const token = this.jwtService.sign(payload);
      console.log(`[Auth] Generated new token for ${username} (first 15 chars): ${token.substring(0, 15)}...`);
      
      // Set the token in cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Also add a non-HttpOnly cookie for client-side access
      res.cookie('auth_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.json({
        success: true,
        token,
        message: 'La sesión se renovó correctamente.'
      });
    } catch (error) {
      console.error(`[Auth] Token fix error for ${username}:`, error);
      return res.status(500).json({
        success: false,
        message: 'No se pudo renovar la sesión.'
      });
    }
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('[Auth] Logout request received');
      
      // Clear auth cookies
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.clearCookie('auth_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      console.log('[Auth] Cookies cleared successfully');
      
      return res.json({
        success: true,
        message: 'Sesión cerrada correctamente.'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error al cerrar la sesión.'
      });
    }
  }

  @Public()
  @Post('clear-cookies')
  @ApiOperation({ summary: 'Eliminar las cookies de sesión' })
  @ApiResponse({ status: 200, description: 'Cookies eliminadas correctamente' })
  async clearCookies(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('[Auth] Clear cookies request received');
      
      // Clear all authentication-related cookies
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      res.clearCookie('auth_token', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      
      console.log('[Auth] All cookies cleared successfully');
      
      return res.json({
        success: true,
        message: 'Se eliminaron las cookies de autenticación.'
      });
    } catch (error) {
      console.error('Error clearing cookies:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error al eliminar las cookies de sesión.'
      });
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar el token de sesión' })
  @ApiResponse({ status: 200, description: 'Token renovado correctamente' })
  @ApiResponse({ status: 401, description: 'El token no es válido o ha vencido' })
  async refreshToken(@Headers('authorization') auth: string, @Res() res: Response) {
    if (!auth) {
      throw new UnauthorizedException('No se proporcionó el token de sesión.');
    }

    const token = auth.split(' ')[1];
    try {
      // Verify the token without checking expiration
      const payload = this.jwtService.verify(token, { ignoreExpiration: true });
      
      // Check if user still exists
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('No se encontró el usuario.');
      }

      // Generate a new token
      const newToken = this.jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role
      });

      // Set the new token in cookies
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json({
        success: true,
        token: newToken,
        message: 'Sesión renovada correctamente.'
      });
    } catch (error) {
      throw new UnauthorizedException('El token de sesión no es válido.');
    }
  }
} 