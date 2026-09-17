export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | string;
  schoolId?: string;
  schoolName?: string;
}

export interface StudentModel {
  id: string;
  rollNumber?: string;
  admissionNo?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  classId?: string;
  sectionId?: string;
  class?: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
}

export interface TeacherModel {
  id: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  qualification?: string;
  designation?: string;
}

export interface ClassModel {
  id: string;
  name: string;
  code?: string;
  sections?: Array<{
    id: string;
    name: string;
  }>;
}

export interface AcademicYearModel {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface NoticeModel {
  id: string;
  title: string;
  category?: string;
  description: string;
  date?: string;
  isPublic?: boolean;
}

export interface HolidayModel {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type?: string;
}

export interface ExamModel {
  id: string;
  name: string;
  term?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeeInvoiceModel {
  id: string;
  invoiceNumber?: string;
  amount: number;
  dueDate?: string;
  status: string;
  student?: {
    firstName: string;
    lastName: string;
  };
}

export interface TimetableModel {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  className?: string;
}
