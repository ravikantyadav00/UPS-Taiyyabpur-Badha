import { SchoolIsolationGuard } from '../../src/common/guards/school-isolation.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('SchoolIsolationGuard', () => {
  let guard: SchoolIsolationGuard;

  beforeEach(() => {
    guard = new SchoolIsolationGuard();
  });

  const createMockContext = (requestObj: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => requestObj,
      }),
    } as any;
  };

  it('should allow request when user schoolId matches query and params', () => {
    const req = {
      user: { schoolId: 'school-A' },
      params: { schoolId: 'school-A' },
      query: { schoolId: 'school-A' },
      body: { schoolId: 'school-A' },
    };
    const context = createMockContext(req);

    expect(guard.canActivate(context)).toBe(true);
    expect(req['schoolId']).toEqual('school-A');
  });

  it('should throw ForbiddenException if client attempts to pass foreign schoolId in params', () => {
    const req = {
      user: { schoolId: 'school-A' },
      params: { schoolId: 'school-B' },
    };
    const context = createMockContext(req);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user has no associated schoolId', () => {
    const req = {
      user: { schoolId: null },
    };
    const context = createMockContext(req);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
