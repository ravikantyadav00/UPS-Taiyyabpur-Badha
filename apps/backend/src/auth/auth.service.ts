import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { identifier, password } = loginDto;

    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      this.logger.warn(`Failed login attempt for identifier: ${identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${user.id}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role, user.schoolId);
    
    // Hash refresh token and store in DB
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);
    await this.usersService.updateLastLogin(user.id);

    // Audit log
    await this.auditService.log({
      schoolId: user.schoolId,
      userId: user.id,
      action: 'AUTH_LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: { role: user.role, identifier },
      ipAddress,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email,
        username: user.username,
        schoolName: user.school?.name,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdentifier(payload.email || payload.username || payload.sub);
    if (!user || user.status !== 'ACTIVE' || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      this.logger.warn(`Revoking refresh tokens due to mismatch for user: ${user.id}`);
      await this.usersService.updateRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token Rotation: Generate new pair of tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role, user.schoolId);
    const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email,
        username: user.username,
      },
    };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findById(userId);
    await this.usersService.updateRefreshTokenHash(userId, null);

    if (user) {
      await this.auditService.log({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'AUTH_LOGOUT',
        entity: 'USER',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
    }

    return { success: true, message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private async generateTokens(
    userId: string,
    email: string | null,
    username: string | null,
    role: string,
    schoolId: string,
  ) {
    const payload = { sub: userId, email, username, role, schoolId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
