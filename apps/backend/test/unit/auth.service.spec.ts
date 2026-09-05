import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../src/audit/audit.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;
  let auditService: Record<string, jest.Mock>;

  const mockUser = {
    id: 'user-123',
    email: 'admin@school.com',
    username: 'admin',
    passwordHash: '',
    role: 'ADMIN' as any,
    status: 'ACTIVE' as any,
    schoolId: 'school-123',
    school: { name: 'Greenwood High' },
    refreshTokenHash: null,
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('Password123!', 10);
  });

  beforeEach(async () => {
    usersService = {
      findByIdentifier: jest.fn(),
      findById: jest.fn(),
      updateRefreshTokenHash: jest.fn().mockResolvedValue({} as any),
      updateLastLogin: jest.fn().mockResolvedValue({} as any),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    auditService = {
      log: jest.fn().mockResolvedValue({} as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.accessSecret') return 'access-secret';
              if (key === 'jwt.refreshSecret') return 'refresh-secret';
              return null;
            }),
          },
        },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      usersService.findByIdentifier.mockResolvedValue(mockUser as any);

      const result = await service.login({
        identifier: 'admin@school.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toEqual('admin@school.com');
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'AUTH_LOGIN' }),
      );
    });

    it('should throw UnauthorizedException for unknown user identifier', async () => {
      usersService.findByIdentifier.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'unknown@school.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByIdentifier.mockResolvedValue(mockUser as any);

      await expect(
        service.login({ identifier: 'admin@school.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash and audit log logout', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await service.logout('user-123');

      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith('user-123', null);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'AUTH_LOGOUT' }),
      );
    });
  });
});
