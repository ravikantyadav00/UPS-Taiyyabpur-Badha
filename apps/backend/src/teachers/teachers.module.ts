import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TeacherPortalController } from './teacher-portal.controller';
import { TeacherPortalService } from './teacher-portal.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [TeachersController, TeacherPortalController],
  providers: [TeachersService, TeacherPortalService],
  exports: [TeachersService, TeacherPortalService],
})
export class TeachersModule {}
