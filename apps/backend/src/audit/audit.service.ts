import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateAuditLogDto {
  schoolId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    try {
      const detailsString =
        typeof dto.details === 'object' ? JSON.stringify(dto.details) : dto.details || null;

      const logEntry = await this.prisma.auditLog.create({
        data: {
          schoolId: dto.schoolId,
          userId: dto.userId,
          action: dto.action,
          entity: dto.entity,
          entityId: dto.entityId,
          details: detailsString,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
      });
      return logEntry;
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${error.message}`, error.stack);
    }
  }
}
