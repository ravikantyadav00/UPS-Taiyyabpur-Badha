import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed Phase 2] Populating Phase 2 sample data...');

  const school = await prisma.school.findFirst({ where: { code: 'GHS001' } });
  if (!school) {
    console.error('School GHS001 not found. Run seed first.');
    return;
  }

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isCurrent: true },
  });

  // 1. Create Class & Sections
  let class10 = await prisma.class.findFirst({
    where: { schoolId: school.id, name: 'Grade 10' },
  });

  if (!class10) {
    class10 = await prisma.class.create({
      data: {
        schoolId: school.id,
        name: 'Grade 10',
        code: 'G10',
        description: 'Tenth grade secondary class',
      },
    });

    await prisma.section.createMany({
      data: [
        { schoolId: school.id, classId: class10.id, name: 'Section A', roomNumber: 'Room 301', capacity: 40 },
        { schoolId: school.id, classId: class10.id, name: 'Section B', roomNumber: 'Room 302', capacity: 40 },
      ],
    });
    console.log('[Seed Phase 2] Created Grade 10 with Section A and Section B');
  }

  const sectionA = await prisma.section.findFirst({
    where: { schoolId: school.id, classId: class10.id, name: 'Section A' },
  });

  // 2. Onboard Teacher
  const teacherEmail = 'john.doe@school.com';
  let teacherUser = await prisma.user.findFirst({ where: { email: teacherEmail } });

  if (!teacherUser) {
    const passwordHash = await bcrypt.hash('TeacherPass123!', 12);

    teacherUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: teacherEmail,
        username: 'johndoe',
        passwordHash,
        role: 'TEACHER',
        status: 'ACTIVE',
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        schoolId: school.id,
        userId: teacherUser.id,
        employeeId: 'EMP-101',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0188',
        email: teacherEmail,
        qualification: 'M.Sc. Mathematics',
        designation: 'Senior Math Teacher',
        status: 'ACTIVE',
      },
    });

    if (academicYear && sectionA) {
      await prisma.teacherAssignment.create({
        data: {
          schoolId: school.id,
          teacherId: teacher.id,
          classId: class10.id,
          sectionId: sectionA.id,
          subjectName: 'Mathematics',
          academicYearId: academicYear.id,
        },
      });
    }

    console.log('[Seed Phase 2] Created Teacher John Doe (EMP-101) with Mathematics assignment');
  }

  // 3. Enroll Student
  const studentAdm = 'ADM-2026-001';
  let student = await prisma.student.findFirst({
    where: { schoolId: school.id, admissionNumber: studentAdm },
  });

  if (!student) {
    const passwordHash = await bcrypt.hash('StudentPass123!', 12);

    const studentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: 'alice.smith@school.com',
        username: studentAdm,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    student = await prisma.student.create({
      data: {
        schoolId: school.id,
        userId: studentUser.id,
        admissionNumber: studentAdm,
        firstName: 'Alice',
        lastName: 'Smith',
        gender: 'Female',
        classId: class10.id,
        sectionId: sectionA?.id,
        rollNumber: '101',
        status: 'ACTIVE',
      },
    });

    const parent = await prisma.parent.create({
      data: {
        schoolId: school.id,
        firstName: 'Robert',
        lastName: 'Smith',
        relationship: 'Father',
        phone: '+1-555-0191',
        email: 'robert.smith@example.com',
      },
    });

    await prisma.studentParent.create({
      data: {
        studentId: student.id,
        parentId: parent.id,
        isPrimaryContact: true,
      },
    });

    console.log('[Seed Phase 2] Enrolled Student Alice Smith (ADM-2026-001) with Parent Robert Smith');
  }

  console.log('[Seed Phase 2] Completed sample data seeding!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
