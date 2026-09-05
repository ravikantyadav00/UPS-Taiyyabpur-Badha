import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phase 3 Seeding...');

  const school = await prisma.school.findFirst({ where: { code: 'GHS001' } });
  if (!school) {
    throw new Error('School GHS001 not found. Please run initial seed first.');
  }

  const academicYear = await prisma.academicYear.findFirst({ where: { schoolId: school.id, isCurrent: true } });
  if (!academicYear) {
    throw new Error('Current academic year not found.');
  }

  const class10 = await prisma.class.findFirst({ where: { schoolId: school.id, name: 'Grade 10' } });
  const sectionA = await prisma.section.findFirst({ where: { classId: class10?.id, name: 'Section A' } });
  const teacher = await prisma.teacher.findFirst({ where: { schoolId: school.id } });
  const students = await prisma.student.findMany({ where: { schoolId: school.id } });

  if (!class10 || students.length === 0) {
    console.log('⚠️ Classes or Students missing, skipping Phase 3 seed.');
    return;
  }

  // 1. Seed Attendance
  console.log('📅 Seeding Attendance...');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const student of students) {
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date: today } },
      update: {},
      create: {
        schoolId: school.id,
        studentId: student.id,
        classId: class10.id,
        sectionId: sectionA?.id,
        date: today,
        status: 'PRESENT',
        remarks: 'On time',
      },
    });

    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date: yesterday } },
      update: {},
      create: {
        schoolId: school.id,
        studentId: student.id,
        classId: class10.id,
        sectionId: sectionA?.id,
        date: yesterday,
        status: student.firstName === 'Alice' ? 'PRESENT' : 'LATE',
        remarks: student.firstName === 'Alice' ? 'On time' : 'Arrived 10 mins late',
      },
    });
  }

  // 2. Seed Exams & Results
  console.log('📝 Seeding Exams & Grades...');
  let exam = await prisma.exam.findFirst({ where: { schoolId: school.id, name: 'Mid-Term 2026' } });
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        name: 'Mid-Term 2026',
        term: 'Mid-Term',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-15'),
        status: 'ONGOING',
      },
    });
  }

  // Exam Subjects
  let mathSubject = await prisma.examSubject.findFirst({ where: { examId: exam.id, subjectName: 'Mathematics' } });
  if (!mathSubject) {
    mathSubject = await prisma.examSubject.create({
      data: {
        examId: exam.id,
        classId: class10.id,
        subjectName: 'Mathematics',
        maxMarks: 100,
        passMarks: 35,
        examDate: new Date('2026-10-02'),
      },
    });
  }

  let scienceSubject = await prisma.examSubject.findFirst({ where: { examId: exam.id, subjectName: 'Science' } });
  if (!scienceSubject) {
    scienceSubject = await prisma.examSubject.create({
      data: {
        examId: exam.id,
        classId: class10.id,
        subjectName: 'Science',
        maxMarks: 100,
        passMarks: 35,
        examDate: new Date('2026-10-05'),
      },
    });
  }

  // Exam Results
  const studentAlice = students.find((s) => s.firstName === 'Alice');
  if (studentAlice && mathSubject) {
    await prisma.examResult.upsert({
      where: { examSubjectId_studentId: { examSubjectId: mathSubject.id, studentId: studentAlice.id } },
      update: {},
      create: {
        examSubjectId: mathSubject.id,
        studentId: studentAlice.id,
        marksObtained: 92,
        grade: 'A+',
        remarks: 'Outstanding performance',
      },
    });
  }

  if (studentAlice && scienceSubject) {
    await prisma.examResult.upsert({
      where: { examSubjectId_studentId: { examSubjectId: scienceSubject.id, studentId: studentAlice.id } },
      update: {},
      create: {
        examSubjectId: scienceSubject.id,
        studentId: studentAlice.id,
        marksObtained: 88,
        grade: 'A',
        remarks: 'Very good understanding',
      },
    });
  }

  // 3. Seed Fee Structure & Invoices
  console.log('💳 Seeding Fees & Billing...');
  let feeStructure = await prisma.feeStructure.findFirst({
    where: { schoolId: school.id, name: 'Tuition Fee - Q1 2026' },
  });
  if (!feeStructure) {
    feeStructure = await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        classId: class10.id,
        name: 'Tuition Fee - Q1 2026',
        amount: 1500.0,
        dueDate: new Date('2026-09-30'),
        description: 'First quarter academic tuition fee',
      },
    });
  }

  if (studentAlice) {
    let invoice = await prisma.feeInvoice.findFirst({
      where: { studentId: studentAlice.id, feeStructureId: feeStructure.id },
    });
    if (!invoice) {
      invoice = await prisma.feeInvoice.create({
        data: {
          schoolId: school.id,
          studentId: studentAlice.id,
          feeStructureId: feeStructure.id,
          invoiceNumber: 'INV-2026-001',
          totalAmount: 1500.0,
          paidAmount: 1500.0,
          dueDate: new Date('2026-09-30'),
          status: 'PAID',
        },
      });

      await prisma.feePayment.create({
        data: {
          invoiceId: invoice.id,
          receiptNumber: 'RCP-2026-001',
          amountPaid: 1500.0,
          paymentMethod: 'ONLINE',
          transactionRef: 'TXN-998811',
          remarks: 'Paid in full via Net Banking',
        },
      });
    }
  }

  // 4. Seed Timetable
  console.log('📅 Seeding Timetable...');
  const scheduleSlots = [
    { day: 'MONDAY', timeStart: '08:30', timeEnd: '09:30', subject: 'Mathematics' },
    { day: 'MONDAY', timeStart: '09:30', timeEnd: '10:30', subject: 'Science' },
    { day: 'MONDAY', timeStart: '10:45', timeEnd: '11:45', subject: 'English' },
    { day: 'TUESDAY', timeStart: '08:30', timeEnd: '09:30', subject: 'Physics' },
    { day: 'TUESDAY', timeStart: '09:30', timeEnd: '10:30', subject: 'Chemistry' },
    { day: 'WEDNESDAY', timeStart: '08:30', timeEnd: '09:30', subject: 'Mathematics' },
  ];

  for (const slot of scheduleSlots) {
    const existingSlot = await prisma.timetablePeriod.findFirst({
      where: {
        schoolId: school.id,
        classId: class10.id,
        dayOfWeek: slot.day,
        startTime: slot.timeStart,
      },
    });

    if (!existingSlot) {
      await prisma.timetablePeriod.create({
        data: {
          schoolId: school.id,
          classId: class10.id,
          sectionId: sectionA?.id,
          teacherId: teacher?.id,
          dayOfWeek: slot.day,
          startTime: slot.timeStart,
          endTime: slot.timeEnd,
          subjectName: slot.subject,
          roomNumber: 'Room 201',
        },
      });
    }
  }

  console.log('✅ Phase 3 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Phase 3 Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
