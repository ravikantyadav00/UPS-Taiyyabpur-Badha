const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiFetchOptions extends RequestInit {
  token?: string;
}

const MOCK_STORAGE_KEY = 'ups_taiyyabpur_badha_mock_db_v4';

interface MockDB {
  school: any;
  classes: any[];
  notices: any[];
  students: any[];
  teachers: any[];
  holidays: any[];
  academicYears: any[];
  exams: any[];
  marks: Record<string, any>;
  attendance: any[];
}

function getInitialMockData(): MockDB {
  const defaultClasses = [
    {
      id: 'c-1',
      name: 'Class 1st',
      code: 'C1',
      description: 'Primary Class 1',
      sections: [{ id: 'sec-1a', name: 'A', roomNumber: '101', capacity: 40 }],
      _count: { students: 25, sections: 1 },
    },
    {
      id: 'c-2',
      name: 'Class 2nd',
      code: 'C2',
      description: 'Primary Class 2',
      sections: [{ id: 'sec-2a', name: 'A', roomNumber: '102', capacity: 40 }],
      _count: { students: 28, sections: 1 },
    },
    {
      id: 'c-3',
      name: 'Class 3rd',
      code: 'C3',
      description: 'Primary Class 3',
      sections: [{ id: 'sec-3a', name: 'A', roomNumber: '103', capacity: 40 }],
      _count: { students: 30, sections: 1 },
    },
    {
      id: 'c-4',
      name: 'Class 4th',
      code: 'C4',
      description: 'Primary Class 4',
      sections: [{ id: 'sec-4a', name: 'A', roomNumber: '104', capacity: 40 }],
      _count: { students: 32, sections: 1 },
    },
    {
      id: 'c-5',
      name: 'Class 5th',
      code: 'C5',
      description: 'Primary Class 5',
      sections: [{ id: 'sec-5a', name: 'A', roomNumber: '105', capacity: 40 }],
      _count: { students: 35, sections: 1 },
    },
    {
      id: 'c-6',
      name: 'Class 6th',
      code: 'C6',
      description: 'Upper Primary Class 6',
      sections: [
        { id: 'sec-6a', name: 'A', roomNumber: '201', capacity: 40 },
        { id: 'sec-6b', name: 'B', roomNumber: '202', capacity: 40 },
      ],
      _count: { students: 42, sections: 2 },
    },
    {
      id: 'c-7',
      name: 'Class 7th',
      code: 'C7',
      description: 'Upper Primary Class 7',
      sections: [
        { id: 'sec-7a', name: 'A', roomNumber: '203', capacity: 40 },
        { id: 'sec-7b', name: 'B', roomNumber: '204', capacity: 40 },
      ],
      _count: { students: 38, sections: 2 },
    },
    {
      id: 'c-8',
      name: 'Class 8th',
      code: 'C8',
      description: 'Upper Primary Class 8',
      sections: [
        { id: 'sec-8a', name: 'A', roomNumber: '205', capacity: 40 },
        { id: 'sec-8b', name: 'B', roomNumber: '206', capacity: 40 },
      ],
      _count: { students: 40, sections: 2 },
    },
  ];

  const defaultStudents = [
    {
      id: 's-101',
      admissionNumber: 'SR-2024-001',
      rollNumber: '101',
      firstName: 'Amit',
      lastName: 'Kumar',
      gender: 'MALE',
      dateOfBirth: '2013-05-15',
      admissionDate: '2024-04-01',
      aadharNumber: '1234-5678-9012',
      careOfName: 'Suresh Kumar',
      fatherName: 'Suresh Kumar',
      fatherAadharNo: '9876-5432-1098',
      motherName: 'Sunita Devi',
      motherAadharNo: '9876-5432-1099',
      mobileNo: '9876543210',
      status: 'ACTIVE',
      classId: 'c-6',
      sectionId: 'sec-6a',
      class: { id: 'c-6', name: 'Class 6th' },
      section: { id: 'sec-6a', name: 'A' },
      user: { email: 'amit.k@school.com' },
    },
    {
      id: 's-102',
      admissionNumber: 'SR-2024-002',
      rollNumber: '102',
      firstName: 'Priya',
      lastName: 'Singh',
      gender: 'FEMALE',
      dateOfBirth: '2012-08-22',
      admissionDate: '2024-04-01',
      aadharNumber: '2345-6789-0123',
      careOfName: 'Rajesh Singh',
      fatherName: 'Rajesh Singh',
      fatherAadharNo: '8765-4321-0987',
      motherName: 'Anjali Singh',
      motherAadharNo: '8765-4321-0988',
      mobileNo: '9876543211',
      status: 'ACTIVE',
      classId: 'c-7',
      sectionId: 'sec-7a',
      class: { id: 'c-7', name: 'Class 7th' },
      section: { id: 'sec-7a', name: 'A' },
      user: { email: 'priya.s@school.com' },
    },
    {
      id: 's-103',
      admissionNumber: 'SR-2024-003',
      rollNumber: '103',
      firstName: 'Rohan',
      lastName: 'Sharma',
      gender: 'MALE',
      dateOfBirth: '2011-11-10',
      admissionDate: '2024-04-01',
      aadharNumber: '3456-7890-1234',
      careOfName: 'Mahesh Sharma',
      fatherName: 'Mahesh Sharma',
      fatherAadharNo: '7654-3210-9876',
      motherName: 'Kavita Sharma',
      motherAadharNo: '7654-3210-9877',
      mobileNo: '9876543212',
      status: 'ACTIVE',
      classId: 'c-8',
      sectionId: 'sec-8a',
      class: { id: 'c-8', name: 'Class 8th' },
      section: { id: 'sec-8a', name: 'A' },
      user: { email: 'rohan.s@school.com' },
    },
    {
      id: 's-104',
      admissionNumber: 'SR-2024-004',
      rollNumber: '104',
      firstName: 'Neha',
      lastName: 'Verma',
      gender: 'FEMALE',
      dateOfBirth: '2014-03-18',
      admissionDate: '2024-04-01',
      aadharNumber: '4567-8901-2345',
      careOfName: 'Vikram Verma',
      fatherName: 'Vikram Verma',
      fatherAadharNo: '6543-2109-8765',
      motherName: 'Rekha Verma',
      motherAadharNo: '6543-2109-8766',
      mobileNo: '9876543213',
      status: 'ACTIVE',
      classId: 'c-5',
      sectionId: 'sec-5a',
      class: { id: 'c-5', name: 'Class 5th' },
      section: { id: 'sec-5a', name: 'A' },
      user: { email: 'neha.v@school.com' },
    },
  ];

  const defaultNotices = [
    {
      id: 'notice-1',
      title: 'Annual Sports Meet 2026-27',
      content: 'UPS Taiyyabpur Badha Annual Sports Meet will be organized from 15th October. All students can register with their Class Teacher.',
      targetAudience: 'ALL',
      date: '2026-09-20',
      createdAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'notice-2',
      title: 'Parent Teacher Meeting (PTM)',
      content: 'Important PTM for Class 1st to 8th scheduled for Saturday at 9:00 AM. Parents are requested to attend.',
      targetAudience: 'PARENTS',
      date: '2026-09-22',
      createdAt: '2026-09-22T09:30:00Z',
    },
    {
      id: 'notice-3',
      title: 'Half Yearly Examination Schedule',
      content: 'Half yearly examinations will commence from 1st November 2026. Detailed date sheet is available in the examination office.',
      targetAudience: 'STUDENTS',
      date: '2026-09-23',
      createdAt: '2026-09-23T11:00:00Z',
    },
  ];

  const defaultTeachers = [
    {
      id: 't-101',
      employeeId: 'EMP-001',
      firstName: 'Rakesh',
      lastName: 'Sharma',
      gender: 'MALE',
      designation: 'Assistant Teacher',
      subject: 'Mathematics & Science',
      qualification: 'M.Sc., B.Ed.',
      mobileNo: '9876501234',
      status: 'ACTIVE',
      user: { email: 'rakesh.sharma@upstaiyyabpurbadha.edu.in' },
    },
    {
      id: 't-102',
      employeeId: 'EMP-002',
      firstName: 'Sunita',
      lastName: 'Verma',
      gender: 'FEMALE',
      designation: 'Head Teacher',
      subject: 'Hindi & Social Studies',
      qualification: 'M.A., B.Ed.',
      mobileNo: '9876505678',
      status: 'ACTIVE',
      user: { email: 'sunita.verma@upstaiyyabpurbadha.edu.in' },
    },
  ];

  const defaultHolidays = [
    { id: 'h-1', title: 'Gandhi Jayanti', startDate: '2026-10-02', endDate: '2026-10-02', description: 'National Holiday' },
    { id: 'h-2', title: 'Dussehra', startDate: '2026-10-24', endDate: '2026-10-25', description: 'Festival Holiday' },
    { id: 'h-3', title: 'Diwali Break', startDate: '2026-11-12', endDate: '2026-11-16', description: 'Festival Holidays' },
  ];

  const defaultAcademicYears = [
    { id: 'ay-1', name: '2026-2027', startDate: '2026-04-01', endDate: '2027-03-31', isCurrent: true },
    { id: 'ay-2', name: '2025-2026', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
  ];

  const defaultExams = [
    {
      id: 'exam-1',
      name: 'Half Yearly Exam 2026',
      academicYearId: 'ay-1',
      status: 'UPCOMING',
      subjects: [
        { id: 'sub-1', name: 'Mathematics', classId: 'c-6', maxMarks: 100, examDate: '2026-11-01' },
        { id: 'sub-2', name: 'Science', classId: 'c-6', maxMarks: 100, examDate: '2026-11-03' },
      ],
    },
  ];

  return {
    school: {
      id: 'school-1',
      name: 'UPS Taiyyabpur Badha',
      code: 'UPSTB001',
      address: 'Taiyyabpur Badha, Greater Noida, Gautam Buddha Nagar, UP - 203207',
      phone: '+91 9876543210',
      email: 'admin@upstaiyyabpurbadha.edu.in',
      principalName: 'Shri Ramesh Chandra',
      establishedYear: '1995',
      academicYear: '2026-2027',
      boardName: 'UP Basic Education Board',
    },
    classes: defaultClasses,
    notices: defaultNotices,
    students: defaultStudents,
    teachers: defaultTeachers,
    holidays: defaultHolidays,
    academicYears: defaultAcademicYears,
    exams: defaultExams,
    marks: {},
    attendance: [],
  };
}

function getMockDB(): MockDB {
  if (typeof window === 'undefined') return getInitialMockData();
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  const initial = getInitialMockData();
  saveMockDB(initial);
  return initial;
}

function saveMockDB(db: MockDB) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {}
}

function handleMockRequest(endpoint: string, options: ApiFetchOptions = {}): any {
  const db = getMockDB();
  const method = (options.method || 'GET').toUpperCase();

  // Parse URL & Query params
  const urlObj = new URL(endpoint, 'http://dummy.local');
  const path = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  const bodyData = options.body ? JSON.parse(options.body as string) : {};

  // Auth
  if (path.startsWith('/auth/login')) {
    let role = 'ADMIN';
    if (bodyData.identifier?.toLowerCase().includes('teacher')) {
      role = 'TEACHER';
    }
    return {
      accessToken: 'demo-access-token-999',
      user: {
        id: role === 'ADMIN' ? 'admin-1' : 'teacher-1',
        email: role === 'ADMIN' ? 'admin@school.com' : 'teacher@school.com',
        username: role === 'ADMIN' ? 'admin' : 'teacher',
        role,
        schoolId: 'school-1',
        schoolName: db.school.name || 'UPS Taiyyabpur Badha',
      },
    };
  }

  if (path.startsWith('/auth/me')) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'admin-1',
      email: 'admin@school.com',
      username: 'admin',
      role: 'ADMIN',
      schoolId: 'school-1',
      schoolName: db.school.name || 'UPS Taiyyabpur Badha',
    };
  }

  if (path.startsWith('/auth/logout')) {
    return { success: true };
  }

  // ==========================================
  // DEDICATED TEACHER PORTAL ROUTES
  // ==========================================
  if (path.startsWith('/teacher/')) {
    // 1. Dashboard Summary
    if (path === '/teacher/dashboard-summary') {
      const totalStudents = db.students.length;
      return {
        teacherName: 'Shri Rakesh Sharma',
        employeeId: 'EMP-001',
        myClassesCount: db.classes.length,
        myStudentsCount: totalStudents,
        todaysAttendanceCount: totalStudents > 0 ? Math.max(0, totalStudents - 2) : 0,
        pendingAttendanceCount: 0,
      };
    }

    // 2. Teacher Profile
    if (path === '/teacher/me') {
      return {
        id: 't-101',
        employeeId: 'EMP-001',
        firstName: 'Rakesh',
        lastName: 'Sharma',
        designation: 'Assistant Teacher',
        qualification: 'M.Sc., B.Ed.',
        phone: '+91 9876501234',
        email: 'rakesh.sharma@upstaiyyabpurbadha.edu.in',
        status: 'ACTIVE',
        joinedDate: '2020-07-15',
        user: {
          id: 'user-t1',
          email: 'teacher@school.com',
          username: 'teacher',
          role: 'TEACHER',
        },
        teacherAssignments: db.classes.slice(0, 4).map((c, idx) => ({
          id: `ta-${idx}`,
          subjectName: c.name.includes('6') ? 'Mathematics' : c.name.includes('7') ? 'Science' : 'General Subjects',
          class: { name: c.name },
          section: { name: c.sections?.[0]?.name || 'A' },
        })),
      };
    }

    // 3. Teacher Assigned Classes List
    if (path === '/teacher/classes') {
      const assigned: any[] = [];
      db.classes.forEach((c) => {
        const secs = c.sections && c.sections.length > 0 ? c.sections : [{ id: 'sec-a', name: 'A' }];
        secs.forEach((sec: any) => {
          const stCount = db.students.filter((s) => s.classId === c.id || s.class?.id === c.id).length || 25;
          assigned.push({
            id: `assign-${c.id}-${sec.id}`,
            classId: c.id,
            sectionId: sec.id,
            className: c.name,
            sectionName: sec.name,
            subjectName: c.name.includes('6') ? 'Mathematics & Science' : c.name.includes('7') ? 'Science' : 'General Subjects',
            academicYear: '2026-2027',
            studentCount: stCount,
          });
        });
      });
      return assigned;
    }

    // 4. Teacher Class Students List (e.g. /teacher/classes/c-6/students)
    if (path.includes('/classes/') && path.endsWith('/students')) {
      const parts = path.split('/').filter(Boolean);
      const classId = parts[2]; // /teacher/classes/:classId/students
      const sectionId = searchParams.get('sectionId');
      let filtered = db.students.filter((s) => s.classId === classId || s.class?.id === classId);
      if (sectionId) {
        filtered = filtered.filter((s) => s.sectionId === sectionId || s.section?.id === sectionId);
      }
      return filtered;
    }

    // 5. Teacher Attendance GET / POST / History
    if (path === '/teacher/attendance' || path.startsWith('/teacher/attendance/')) {
      if (path === '/teacher/attendance/bulk' && method === 'POST') {
        const recs = bodyData.records || [];
        recs.forEach((r: any) => {
          db.attendance.push({ ...r, date: bodyData.date, classId: bodyData.classId });
        });
        saveMockDB(db);
        return { success: true, count: recs.length };
      }

      if (path === '/teacher/attendance/history') {
        return [
          { date: '2026-09-24', presentCount: 33, absentCount: 2, leaveCount: 0, totalCount: 35 },
          { date: '2026-09-23', presentCount: 34, absentCount: 1, leaveCount: 0, totalCount: 35 },
          { date: '2026-09-22', presentCount: 32, absentCount: 2, leaveCount: 1, totalCount: 35 },
        ];
      }

      // GET /teacher/attendance?classId=...&sectionId=...&date=...
      const classId = searchParams.get('classId');
      const sectionId = searchParams.get('sectionId');
      let classStudents = db.students;
      if (classId) {
        classStudents = classStudents.filter((s) => s.classId === classId || s.class?.id === classId);
      }
      if (sectionId) {
        classStudents = classStudents.filter((s) => s.sectionId === sectionId || s.section?.id === sectionId);
      }

      const records = classStudents.map((s) => ({
        studentId: s.id,
        rollNumber: s.rollNumber || '101',
        studentName: `${s.firstName} ${s.lastName || ''}`.trim(),
        status: 'PRESENT',
        remarks: '',
      }));

      return {
        date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        isHoliday: false,
        holidayTitle: null,
        holidayDescription: null,
        records,
      };
    }

    // 6. Teacher Student Detail (e.g. /teacher/students/s-101)
    if (path.startsWith('/teacher/students/')) {
      const parts = path.split('/').filter(Boolean);
      const studentId = parts[parts.length - 1];
      const found = db.students.find((s) => s.id === studentId) || db.students[0];
      return {
        student: found,
        attendanceStats: {
          totalRecords: 90,
          presentCount: 86,
          absentCount: 3,
          lateCount: 1,
          attendanceRate: 95.5,
          totalDays: 90,
          presentDays: 86,
          absentDays: 3,
          leaveDays: 1,
          percentage: 95.5,
        },
        recentAttendance: [
          { date: '2026-09-24', status: 'PRESENT' },
          { date: '2026-09-23', status: 'PRESENT' },
          { date: '2026-09-22', status: 'ABSENT' },
        ],
      };
    }
  }

  // School Profile
  if (path.startsWith('/schools/me')) {
    if (method === 'PATCH' || method === 'PUT') {
      db.school = { ...db.school, ...bodyData };
      saveMockDB(db);
      return db.school;
    }
    return db.school;
  }

  // Notices CRUD
  if (path === '/notices' || path.startsWith('/notices/')) {
    const parts = path.split('/').filter(Boolean);
    const noticeId = parts[1];

    if (method === 'GET') {
      return db.notices;
    }

    if (method === 'POST') {
      const newNotice = {
        id: 'notice-' + Date.now(),
        title: bodyData.title || 'New Notice',
        content: bodyData.content || '',
        targetAudience: bodyData.targetAudience || 'ALL',
        date: bodyData.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      db.notices.unshift(newNotice);
      saveMockDB(db);
      return newNotice;
    }

    if ((method === 'PATCH' || method === 'PUT') && noticeId) {
      db.notices = db.notices.map((n) => (n.id === noticeId ? { ...n, ...bodyData } : n));
      saveMockDB(db);
      const updated = db.notices.find((n) => n.id === noticeId);
      return updated || { success: true };
    }

    if (method === 'DELETE' && noticeId) {
      db.notices = db.notices.filter((n) => n.id !== noticeId);
      saveMockDB(db);
      return { success: true };
    }
  }

  // Admin Classes & Sections CRUD
  if (path.startsWith('/classes')) {
    const parts = path.split('/').filter(Boolean);
    const classId = parts[parts.length - 1];

    if (method === 'GET') {
      if (classId && classId !== 'classes') {
        const found = db.classes.find((c) => c.id === classId);
        if (found) return found;
      }
      return db.classes;
    }

    if (method === 'POST') {
      const newClass = {
        id: 'c-' + Date.now(),
        name: bodyData.name || 'New Class',
        code: bodyData.code || '',
        description: bodyData.description || '',
        sections: bodyData.sections || [{ id: 'sec-' + Date.now(), name: 'A', roomNumber: '101', capacity: 40 }],
        _count: { students: 0, sections: bodyData.sections?.length || 1 },
      };
      db.classes.push(newClass);
      saveMockDB(db);
      return newClass;
    }

    if (method === 'DELETE' && classId) {
      db.classes = db.classes.filter((c) => c.id !== classId);
      saveMockDB(db);
      return { success: true };
    }
  }

  // Admin Students CRUD
  if (path === '/students' || path.startsWith('/students/')) {
    const parts = path.split('/').filter(Boolean);
    const studentId = parts[parts.length - 1] !== 'students' ? parts[parts.length - 1] : null;

    if (path === '/students/bulk-upload' && method === 'POST') {
      const rows = bodyData.rows || [];
      const newStudents = rows.map((r: any, idx: number) => {
        const clsObj = db.classes.find((c) => c.id === r.classId || c.name === r.classId) || db.classes[0];
        return {
          id: 's-' + Date.now() + '-' + idx,
          admissionNumber: r.admissionNumber || `SR-${Date.now()}-${idx}`,
          rollNumber: r.rollNumber || `${100 + idx}`,
          firstName: r.firstName || r.name || 'Student',
          lastName: r.lastName || '',
          gender: r.gender || 'MALE',
          dateOfBirth: r.dateOfBirth || '2014-01-01',
          admissionDate: r.admissionDate || new Date().toISOString().split('T')[0],
          aadharNumber: r.aadharNumber || '',
          careOfName: r.careOfName || r.fatherName || '',
          fatherName: r.fatherName || '',
          fatherAadharNo: r.fatherAadharNo || '',
          motherName: r.motherName || '',
          motherAadharNo: r.motherAadharNo || '',
          mobileNo: r.mobileNo || '',
          status: 'ACTIVE',
          classId: clsObj.id,
          sectionId: clsObj.sections?.[0]?.id || 'sec-1a',
          class: { id: clsObj.id, name: clsObj.name },
          section: { id: clsObj.sections?.[0]?.id || 'sec-1a', name: clsObj.sections?.[0]?.name || 'A' },
          user: { email: `student-${idx}@school.com` },
        };
      });
      db.students.push(...newStudents);
      saveMockDB(db);
      return { successCount: newStudents.length, failureCount: 0, errors: [] };
    }

    if (method === 'GET') {
      if (studentId && studentId !== 'students') {
        const found = db.students.find((s) => s.id === studentId);
        if (found) return found;
      }
      let result = [...db.students];
      const search = searchParams.get('search')?.toLowerCase();
      const classId = searchParams.get('classId');
      if (classId) {
        result = result.filter((s) => s.classId === classId || s.class?.id === classId);
      }
      if (search) {
        result = result.filter(
          (s) =>
            s.firstName?.toLowerCase().includes(search) ||
            s.lastName?.toLowerCase().includes(search) ||
            s.admissionNumber?.toLowerCase().includes(search) ||
            s.rollNumber?.toLowerCase().includes(search)
        );
      }
      return result;
    }

    if (method === 'POST') {
      const clsObj = db.classes.find((c) => c.id === bodyData.classId) || db.classes[0];
      const secObj = clsObj?.sections?.find((s: any) => s.id === bodyData.sectionId) || clsObj?.sections?.[0];
      const newStudent = {
        id: 's-' + Date.now(),
        admissionNumber: bodyData.admissionNumber || `SR-${Date.now()}`,
        rollNumber: bodyData.rollNumber || '101',
        firstName: bodyData.firstName || 'Student',
        lastName: bodyData.lastName || '',
        gender: bodyData.gender || 'MALE',
        dateOfBirth: bodyData.dateOfBirth || '2014-01-01',
        admissionDate: bodyData.admissionDate || new Date().toISOString().split('T')[0],
        aadharNumber: bodyData.aadharNumber || '',
        careOfName: bodyData.careOfName || bodyData.fatherName || '',
        fatherName: bodyData.fatherName || '',
        fatherAadharNo: bodyData.fatherAadharNo || '',
        motherName: bodyData.motherName || '',
        motherAadharNo: bodyData.motherAadharNo || '',
        mobileNo: bodyData.mobileNo || '',
        status: 'ACTIVE',
        classId: clsObj.id,
        sectionId: secObj?.id || 'sec-1a',
        class: { id: clsObj.id, name: clsObj.name },
        section: { id: secObj?.id || 'sec-1a', name: secObj?.name || 'A' },
        user: { email: `student-${Date.now()}@school.com` },
      };
      db.students.unshift(newStudent);
      if (clsObj) {
        clsObj._count.students = (clsObj._count.students || 0) + 1;
      }
      saveMockDB(db);
      return newStudent;
    }

    if ((method === 'PATCH' || method === 'PUT') && studentId) {
      db.students = db.students.map((s) => (s.id === studentId ? { ...s, ...bodyData } : s));
      saveMockDB(db);
      const updated = db.students.find((s) => s.id === studentId);
      return updated || { success: true };
    }

    if (method === 'DELETE') {
      if (studentId && studentId !== 'students') {
        db.students = db.students.filter((s) => s.id !== studentId);
      } else {
        db.students = [];
      }
      saveMockDB(db);
      return { success: true };
    }
  }

  // Teachers CRUD
  if (path === '/teachers' || path.startsWith('/teachers/')) {
    const parts = path.split('/').filter(Boolean);
    const teacherId = parts[parts.length - 1] !== 'teachers' ? parts[parts.length - 1] : null;

    if (method === 'GET') {
      if (teacherId && teacherId !== 'teachers') {
        const found = db.teachers.find((t) => t.id === teacherId);
        if (found) return found;
      }
      return db.teachers;
    }

    if (method === 'POST') {
      const newTeacher = {
        id: 't-' + Date.now(),
        employeeId: bodyData.employeeId || `EMP-${Date.now()}`,
        firstName: bodyData.firstName || 'Teacher',
        lastName: bodyData.lastName || '',
        gender: bodyData.gender || 'MALE',
        designation: bodyData.designation || 'Assistant Teacher',
        subject: bodyData.subject || 'General',
        qualification: bodyData.qualification || 'B.Ed.',
        mobileNo: bodyData.mobileNo || '',
        status: 'ACTIVE',
        user: { email: bodyData.email || `teacher-${Date.now()}@school.com` },
      };
      db.teachers.unshift(newTeacher);
      saveMockDB(db);
      return newTeacher;
    }

    if ((method === 'PATCH' || method === 'PUT') && teacherId) {
      db.teachers = db.teachers.map((t) => (t.id === teacherId ? { ...t, ...bodyData } : t));
      saveMockDB(db);
      return db.teachers.find((t) => t.id === teacherId) || { success: true };
    }

    if (method === 'DELETE' && teacherId) {
      db.teachers = db.teachers.filter((t) => t.id !== teacherId);
      saveMockDB(db);
      return { success: true };
    }
  }

  // Holidays CRUD
  if (path.startsWith('/holidays')) {
    const parts = path.split('/').filter(Boolean);
    const holidayId = parts[1];

    if (method === 'GET') return db.holidays;

    if (method === 'POST') {
      const newHoliday = {
        id: 'h-' + Date.now(),
        title: bodyData.title || 'Holiday',
        startDate: bodyData.startDate || new Date().toISOString().split('T')[0],
        endDate: bodyData.endDate || new Date().toISOString().split('T')[0],
        description: bodyData.description || '',
      };
      db.holidays.unshift(newHoliday);
      saveMockDB(db);
      return newHoliday;
    }

    if (method === 'DELETE' && holidayId) {
      db.holidays = db.holidays.filter((h) => h.id !== holidayId);
      saveMockDB(db);
      return { success: true };
    }
  }

  // Academic Years CRUD
  if (path.startsWith('/academic-years')) {
    const parts = path.split('/').filter(Boolean);
    const yearId = parts[1];

    if (method === 'GET') return db.academicYears;

    if (method === 'POST') {
      const newYear = {
        id: 'ay-' + Date.now(),
        name: bodyData.name || '2027-2028',
        startDate: bodyData.startDate || '2027-04-01',
        endDate: bodyData.endDate || '2028-03-31',
        isCurrent: false,
      };
      db.academicYears.push(newYear);
      saveMockDB(db);
      return newYear;
    }

    if (path.endsWith('/set-current') && method === 'PATCH') {
      db.academicYears = db.academicYears.map((ay) => ({
        ...ay,
        isCurrent: ay.id === yearId,
      }));
      saveMockDB(db);
      return { success: true };
    }
  }

  // Exams CRUD
  if (path.startsWith('/exams')) {
    if (method === 'GET') return db.exams;

    if (method === 'POST') {
      if (path.endsWith('/marks')) {
        db.marks = { ...db.marks, ...bodyData };
        saveMockDB(db);
        return { success: true };
      }
      const newExam = {
        id: 'exam-' + Date.now(),
        name: bodyData.name || 'New Exam',
        academicYearId: bodyData.academicYearId || 'ay-1',
        status: 'UPCOMING',
        subjects: bodyData.subjects || [],
      };
      db.exams.push(newExam);
      saveMockDB(db);
      return newExam;
    }
  }

  // Fallback default for any non-GET modification
  if (method !== 'GET') {
    return { success: true };
  }

  return [];
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...customOptions } = options;

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authToken = token || storedToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      headers,
      credentials: 'include',
      ...customOptions,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg) as any;
      error.status = response.status;
      error.errorCode = data.errorCode || 'UNKNOWN_ERROR';
      error.data = data;
      throw error;
    }

    return data.data !== undefined ? data.data : data;
  } catch (err: any) {
    // If backend server is offline/unreachable or network fails, use seamless mock DB
    if (
      err.name === 'TypeError' ||
      err.message?.includes('fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Failed to fetch')
    ) {
      return handleMockRequest(endpoint, options);
    }
    throw err;
  }
}
