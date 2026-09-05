import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SchoolIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.schoolId) {
      throw new ForbiddenException('User is not associated with any school entity');
    }

    // Ensure client cannot override schoolId in params or body to access another school
    if (request.params && request.params.schoolId && request.params.schoolId !== user.schoolId) {
      throw new ForbiddenException('Cross-school data access attempt prohibited');
    }

    if (request.query && request.query.schoolId && request.query.schoolId !== user.schoolId) {
      throw new ForbiddenException('Cross-school query param access attempt prohibited');
    }

    if (request.body && request.body.schoolId && request.body.schoolId !== user.schoolId) {
      throw new ForbiddenException('Cross-school body payload manipulation prohibited');
    }

    // Explicitly attach user's schoolId to request for service-level scoping
    request.schoolId = user.schoolId;

    return true;
  }
}
