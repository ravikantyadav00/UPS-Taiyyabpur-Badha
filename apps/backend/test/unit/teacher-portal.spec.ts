import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TeacherPortalService } from '../../src/teachers/teacher-portal.service';

describe('TeacherPortalService Security & Assignment Verification', () => {
  let service: TeacherPortalService;
  let prismaMock: any;
  let auditMock: any;

  beforeEach(() => {
    prismaMock = {
      teacher: {
        findFirst: jest.fn(),
      },
      teacherAssignment: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      student: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      attendance: {
        count: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      academicYear: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };

    auditMock = {
      log: jest.fn().mockResolvedValue(true),
    };

    service = new TeacherPortalService(prismaMock, auditMock);
  });

  describe('verifyTeacherAssignment', () => {
    it('should throw ForbiddenException if teacher is not assigned to class', async () => {
      prismaMock.teacherAssignment.findMany.mockResolvedValue([]);

      await expect(
        service.verifyTeacherAssignment('teacher-1', 'school-1', 'class-99')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return assignment if teacher is assigned to class', async () => {
      const mockAssignment = { id: 'assign-1', teacherId: 'teacher-1', classId: 'class-1' };
      prismaMock.teacherAssignment.findMany.mockResolvedValue([mockAssignment]);

      const result = await service.verifyTeacherAssignment('teacher-1', 'school-1', 'class-1');
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('getStudentsForClass (Data Privacy)', () => {
    it('should query only non-sensitive student fields', async () => {
      prismaMock.teacher.findFirst.mockResolvedValue({ id: 'teacher-1', userId: 'user-1' });
      prismaMock.teacherAssignment.findMany.mockResolvedValue([{ id: 'assign-1' }]);
      prismaMock.student.findMany.mockResolvedValue([
        {
          id: 'student-1',
          admissionNumber: 'ADM-001',
          firstName: 'Rahul',
          lastName: 'Kumar',
          rollNumber: '01',
          gender: 'Male',
          dateOfBirth: new Date(),
          class: { id: 'c1', name: 'Class 5' },
          section: { id: 's1', name: 'A' },
        },
      ]);

      const students = await service.getStudentsForClass('user-1', 'school-1', 'class-1', 'sec-1');
      expect(students).toHaveLength(1);
      expect(students[0]).not.toHaveProperty('aadharNumber');
      expect(students[0]).not.toHaveProperty('fatherAadharNo');
      expect(students[0]).not.toHaveProperty('motherAadharNo');
      expect(students[0]).not.toHaveProperty('passwordHash');
    });
  });
});
