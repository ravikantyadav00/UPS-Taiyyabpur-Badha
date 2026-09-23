const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiFetchOptions extends RequestInit {
  token?: string;
}

// Fallback mock responses when live backend API is unreachable
function getMockFallback(endpoint: string, options: ApiFetchOptions = {}): any {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanEndpoint.startsWith('/auth/login')) {
    let role = 'ADMIN';
    if (options.body) {
      try {
        const parsed = JSON.parse(options.body as string);
        if (parsed.identifier?.toLowerCase().includes('teacher')) {
          role = 'TEACHER';
        }
      } catch (e) {}
    }
    return {
      accessToken: 'demo-access-token-999',
      user: {
        id: role === 'ADMIN' ? 'admin-1' : 'teacher-1',
        email: role === 'ADMIN' ? 'admin@school.com' : 'teacher@school.com',
        username: role === 'ADMIN' ? 'admin' : 'teacher',
        role,
        schoolId: 'school-1',
        schoolName: 'UPS Taiyyabpur Badha',
      },
    };
  }

  if (cleanEndpoint.startsWith('/auth/me')) {
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
      schoolName: 'UPS Taiyyabpur Badha',
    };
  }

  if (cleanEndpoint.startsWith('/schools/me')) {
    return {
      id: 'school-1',
      name: 'UPS Taiyyabpur Badha',
      code: 'UPSTB001',
      address: 'Taiyyabpur Badha, Uttar Pradesh',
      phone: '+91 9876543210',
      email: 'admin@upstaiyyabpurbadha.edu.in',
      academicYear: '2026-2027',
    };
  }

  if (cleanEndpoint.startsWith('/notices')) {
    if (options.method === 'DELETE' || options.method === 'POST' || options.method === 'PATCH') {
      return { success: true };
    }
    return [
      {
        id: 'notice-1',
        title: 'Annual Sports Meet 2026',
        content: 'UPS Taiyyabpur Badha Annual Sports Meet will be held next week.',
        date: '2026-09-20',
        targetAudience: 'ALL',
      },
      {
        id: 'notice-2',
        title: 'Parent Teacher Meeting',
        content: 'PTM for Class 1 to 8 scheduled for Saturday.',
        date: '2026-09-22',
        targetAudience: 'PARENTS',
      },
    ];
  }

  if (cleanEndpoint.startsWith('/academic-years')) {
    return [{ id: 'ay-1', name: '2026-2027', isCurrent: true, startDate: '2026-04-01', endDate: '2027-03-31' }];
  }

  if (cleanEndpoint.startsWith('/teachers')) {
    return [
      { id: 't-1', name: 'Rakesh Sharma', subject: 'Mathematics', phone: '+91 9876501234', email: 'rakesh@school.com' },
      { id: 't-2', name: 'Sunita Verma', subject: 'Science', phone: '+91 9876505678', email: 'sunita@school.com' },
    ];
  }

  if (cleanEndpoint.startsWith('/students')) {
    return [
      { id: 's-1', rollNo: '101', name: 'Amit Kumar', className: 'Class 6th', section: 'A', fatherName: 'Suresh Kumar' },
      { id: 's-2', rollNo: '102', name: 'Priya Singh', className: 'Class 7th', section: 'A', fatherName: 'Rajesh Singh' },
    ];
  }

  if (cleanEndpoint.startsWith('/teacher/classes') || cleanEndpoint.startsWith('/classes')) {
    return [
      { id: 'c-1', name: 'Class 6th A', studentCount: 35 },
      { id: 'c-2', name: 'Class 7th A', studentCount: 32 },
      { id: 'c-3', name: 'Class 8th A', studentCount: 30 },
    ];
  }

  if (cleanEndpoint.startsWith('/teacher/dashboard-summary')) {
    return {
      assignedClassesCount: 3,
      totalStudentsCount: 97,
      todayAttendancePercentage: 94,
    };
  }

  if (options.method && options.method !== 'GET') {
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
    // If backend server is offline/unreachable or network fails, use seamless mock fallback
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
      console.warn(`[API] Backend unreachable (${endpoint}), returning demo fallback.`);
      return getMockFallback(endpoint, options);
    }
    throw err;
  }
}
