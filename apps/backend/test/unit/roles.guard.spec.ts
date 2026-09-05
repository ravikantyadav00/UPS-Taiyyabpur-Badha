import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../../src/common/guards/roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../src/common/decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('should allow access if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext({ role: Role.TEACHER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has non-allowed role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.TEACHER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not attached to request', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
