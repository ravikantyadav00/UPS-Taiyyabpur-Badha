import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFeeStructureDto, GenerateInvoicesDto, RecordPaymentDto } from './dto/create-fee.dto';

@Injectable()
export class FeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findStructures(schoolId: string) {
    return this.prisma.feeStructure.findMany({
      where: { schoolId },
      include: {
        academicYear: true,
        class: true,
        _count: { select: { feeInvoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStructure(schoolId: string, dto: CreateFeeStructureDto) {
    return this.prisma.feeStructure.create({
      data: {
        schoolId,
        academicYearId: dto.academicYearId,
        classId: dto.classId || null,
        name: dto.name,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        description: dto.description,
      },
    });
  }

  async generateInvoices(schoolId: string, dto: GenerateInvoicesDto) {
    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { id: dto.feeStructureId, schoolId },
    });

    if (!feeStructure) {
      throw new NotFoundException(`Fee structure not found`);
    }

    const studentWhere: any = { schoolId };
    if (dto.classId || feeStructure.classId) {
      studentWhere.classId = dto.classId || feeStructure.classId;
    }

    const students = await this.prisma.student.findMany({ where: studentWhere });

    let createdCount = 0;
    for (const student of students) {
      const existing = await this.prisma.feeInvoice.findFirst({
        where: { studentId: student.id, feeStructureId: feeStructure.id },
      });

      if (!existing) {
        const invCount = await this.prisma.feeInvoice.count({ where: { schoolId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(4, '0')}`;

        await this.prisma.feeInvoice.create({
          data: {
            schoolId,
            studentId: student.id,
            feeStructureId: feeStructure.id,
            invoiceNumber,
            totalAmount: feeStructure.amount,
            paidAmount: 0,
            dueDate: feeStructure.dueDate,
            status: 'PENDING',
          },
        });
        createdCount++;
      }
    }

    return { message: `Successfully generated ${createdCount} fee invoices`, count: createdCount };
  }

  async findInvoices(schoolId: string, status?: string, classId?: string) {
    const where: any = { schoolId };
    if (status) where.status = status;
    if (classId) where.student = { classId };

    return this.prisma.feeInvoice.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
            class: true,
          },
        },
        feeStructure: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordPayment(schoolId: string, dto: RecordPaymentDto) {
    const invoice = await this.prisma.feeInvoice.findFirst({
      where: { id: dto.invoiceId, schoolId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice not found`);
    }

    const remainingDue = invoice.totalAmount - invoice.paidAmount;
    if (dto.amountPaid > remainingDue + 0.01) {
      throw new BadRequestException(`Amount paid exceeds remaining balance of $${remainingDue}`);
    }

    const newPaidAmount = invoice.paidAmount + dto.amountPaid;
    const newStatus = newPaidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIAL';

    const rcpCount = await this.prisma.feePayment.count();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${(rcpCount + 1).toString().padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.feePayment.create({
        data: {
          invoiceId: invoice.id,
          receiptNumber,
          amountPaid: dto.amountPaid,
          paymentMethod: dto.paymentMethod,
          transactionRef: dto.transactionRef,
          remarks: dto.remarks,
        },
      });

      await tx.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      return payment;
    });
  }

  async getFinancialStats(schoolId: string) {
    const invoices = await this.prisma.feeInvoice.findMany({ where: { schoolId } });

    const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const pendingDues = totalBilled - totalCollected;

    const paidInvoicesCount = invoices.filter((i) => i.status === 'PAID').length;
    const pendingInvoicesCount = invoices.filter((i) => i.status === 'PENDING' || i.status === 'PARTIAL').length;

    return {
      totalBilled,
      totalCollected,
      pendingDues,
      paidInvoicesCount,
      pendingInvoicesCount,
      totalInvoicesCount: invoices.length,
    };
  }
}
