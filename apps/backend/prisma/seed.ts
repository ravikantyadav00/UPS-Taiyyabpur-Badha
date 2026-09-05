import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const schoolName = process.env.SCHOOL_NAME || 'Greenwood High School';
  const schoolCode = process.env.SCHOOL_CODE || 'GHS001';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecret123!';

  console.log(`[Seed] Starting seed process...`);

  // 1. Seed School
  const school = await prisma.school.upsert({
    where: { code: schoolCode },
    update: {
      name: schoolName,
    },
    create: {
      name: schoolName,
      code: schoolCode,
      email: adminEmail,
      phone: '+1-555-0199',
      address: '123 Education Lane, Knowledge City',
      website: 'https://greenwoodhigh.edu',
      principalName: 'Dr. Eleanor Vance',
      status: 'ACTIVE',
    },
  });

  console.log(`[Seed] School created/found: ${school.name} (${school.code}) - ID: ${school.id}`);

  // 2. Seed Admin User
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      schoolId: school.id,
    },
    create: {
      email: adminEmail,
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      schoolId: school.id,
    },
  });

  console.log(`[Seed] Admin user created/found: ${adminUser.email} - ID: ${adminUser.id}`);

  // 3. Seed Initial Academic Year
  const currentYear = new Date().getFullYear();
  const academicYearName = `${currentYear}-${currentYear + 1}`;
  
  const existingAcademicYear = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isCurrent: true },
  });

  if (!existingAcademicYear) {
    const academicYear = await prisma.academicYear.create({
      data: {
        schoolId: school.id,
        name: academicYearName,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-06-30`),
        isCurrent: true,
        status: 'ACTIVE',
      },
    });
    console.log(`[Seed] Initial Academic Year created: ${academicYear.name}`);
  } else {
    console.log(`[Seed] Academic Year already exists: ${existingAcademicYear.name}`);
  }

  // 4. Create initial Audit Log entry
  await prisma.auditLog.create({
    data: {
      schoolId: school.id,
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'SYSTEM',
      entityId: school.id,
      details: JSON.stringify({ message: 'Database seeded successfully with initial admin user and school.' }),
    },
  });

  console.log(`[Seed] Seed process completed successfully!`);
}

main()
  .catch((e) => {
    console.error(`[Seed] Error during seeding:`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
