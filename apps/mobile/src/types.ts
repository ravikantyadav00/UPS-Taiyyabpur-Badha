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
  admissionNumber?: string;
  admissionNo?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  aadharNumber?: string;
  careOfName?: string;
  fatherName?: string;
  fatherAadharNo?: string;
  motherName?: string;
  motherAadharNo?: string;
  mobileNo?: string;
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

export interface ExamSubjectModel {
  id: string;
  classId: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  examDate?: string;
  class?: { name: string };
  _count?: { examResults: number };
}

export interface ExamModel {
  id: string;
  name: string;
  term?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  academicYear?: { name: string };
  examSubjects?: ExamSubjectModel[];
}

export interface ReportCardModel {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    className: string;
    sectionName: string;
  };
  results: {
    examName: string;
    term?: string;
    subjectName: string;
    maxMarks: number;
    passMarks: number;
    marksObtained: number;
    grade: string;
    remarks?: string;
  }[];
  summary: {
    totalObtained: number;
    totalMax: number;
    percentage: number;
    overallGrade: string;
  };
}

export interface FeeStructureModel {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
  class?: { name: string };
  academicYear?: { name: string };
}

export interface FeePaymentModel {
  id: string;
  receiptNumber: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  transactionRef?: string;
}

export interface FeeInvoiceModel {
  id: string;
  invoiceNumber?: string;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  status: string;
  student?: {
    id?: string;
    admissionNumber?: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
  };
  feeStructure?: { name: string };
  payments?: FeePaymentModel[];
}

export interface FinancialStatsModel {
  totalBilled: number;
  totalCollected: number;
  pendingDues: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  totalInvoicesCount: number;
}

export interface TimetableModel {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  roomNumber?: string;
  classId?: string;
  sectionId?: string;
  teacher?: { firstName: string; lastName: string };
}

export interface BulkStudentImportRow {
  rowNum: number;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  rollNumber?: string;
  aadharNumber?: string;
  careOfName?: string;
  classId?: string;
  sectionId?: string;
  className?: string;
  sectionName?: string;
  fatherName?: string;
  fatherAadharNo?: string;
  motherName?: string;
  motherAadharNo?: string;
  mobileNo?: string;
  isValid: boolean;
  errors: string[];
}

