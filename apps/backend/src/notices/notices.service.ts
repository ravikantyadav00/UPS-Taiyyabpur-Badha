import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return (this.prisma as any).notice.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string) {
    const notice = await (this.prisma as any).notice.findFirst({
      where: { id, schoolId },
    });
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    return notice;
  }

  async create(schoolId: string, dto: CreateNoticeDto) {
    return (this.prisma as any).notice.create({
      data: {
        schoolId,
        title: dto.title,
        category: dto.category || 'GENERAL',
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
        isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
      },
    });
  }

  async update(schoolId: string, id: string, dto: UpdateNoticeDto) {
    await this.findOne(schoolId, id);
    const dataToUpdate: any = { ...dto };
    if (dto.date) {
      dataToUpdate.date = new Date(dto.date);
    }
    return (this.prisma as any).notice.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findOne(schoolId, id);
    return (this.prisma as any).notice.delete({
      where: { id },
    });
  }
}
