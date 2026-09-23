import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import * as XLSX from 'xlsx';
import {
  UserProfile,
  StudentModel,
  TeacherModel,
  ClassModel,
  AcademicYearModel,
  NoticeModel,
  HolidayModel,
  ExamModel,
  FeeInvoiceModel,
  FeeStructureModel,
  FinancialStatsModel,
  TimetableModel,
  ReportCardModel,
  BulkStudentImportRow,
} from '../types';

interface AdminPortalProps {
  user: UserProfile;
  token: string;
  apiBaseUrl: string;
  onLogout: () => void;
  refreshPublicData: () => void;
}

type AdminModule =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'academics'
  | 'attendance'
  | 'exams'
  | 'fees'
  | 'timetables'
  | 'notices'
  | 'holidays'
  | 'school';

export default function AdminPortal({
  user,
  token,
  apiBaseUrl,
  onLogout,
  refreshPublicData,
}: AdminPortalProps) {
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [teachers, setTeachers] = useState<TeacherModel[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearModel[]>([]);
  const [notices, setNotices] = useState<NoticeModel[]>([]);
  const [holidays, setHolidays] = useState<HolidayModel[]>([]);
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoiceModel[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureModel[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStatsModel | null>(null);
  const [timetables, setTimetables] = useState<TimetableModel[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  // General Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Shared Form Input Fields
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRoll, setFRoll] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fCategory, setFCategory] = useState('ACADEMIC');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. Excel Bulk Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<BulkStudentImportRow[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ successCount: number; failureCount: number; message?: string } | null>(null);

  // 2. Report Card State
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [selectedReportStudentId, setSelectedReportStudentId] = useState('');
  const [reportCardData, setReportCardData] = useState<ReportCardModel | null>(null);
  const [loadingReportCard, setLoadingReportCard] = useState(false);

  // 3. Fees Billing State
  const [feesSubTab, setFeesSubTab] = useState<'invoices' | 'structures'>('invoices');
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showGenerateInvoicesModal, setShowGenerateInvoicesModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoiceModel | null>(null);

  // Fee Form Inputs
  const [feeStructName, setFeeStructName] = useState('');
  const [feeStructAmount, setFeeStructAmount] = useState('1500');
  const [feeStructDueDate, setFeeStructDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeStructDesc, setFeeStructDesc] = useState('');
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState('');
  const [selectedFeeClassId, setSelectedFeeClassId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [paymentRef, setPaymentRef] = useState('');

  // 4. Timetable State
  const [ttSelectedClassId, setTtSelectedClassId] = useState('');
  const [ttSelectedSectionId, setTtSelectedSectionId] = useState('');
  const [showTtModal, setShowTtModal] = useState(false);
  const [ttDayOfWeek, setTtDayOfWeek] = useState('MONDAY');
  const [ttStartTime, setTtStartTime] = useState('09:00');
  const [ttEndTime, setTtEndTime] = useState('09:45');
  const [ttSubjectName, setTtSubjectName] = useState('Mathematics');
  const [ttTeacherId, setTtTeacherId] = useState('');
  const [ttRoomNumber, setTtRoomNumber] = useState('Room 101');

  // Load Module Data
  const loadModuleData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (activeModule === 'overview') {
        const [stRes, tcRes, clRes, nRes, hRes] = await Promise.all([
          fetch(`${apiBaseUrl}/students`, { headers }),
          fetch(`${apiBaseUrl}/teachers`, { headers }),
          fetch(`${apiBaseUrl}/classes`, { headers }),
          fetch(`${apiBaseUrl}/notices`, { headers }),
          fetch(`${apiBaseUrl}/holidays`, { headers }),
        ]);

        const st = await stRes.json();
        const tc = await tcRes.json();
        const cl = await clRes.json();
        const nt = await nRes.json();
        const hl = await hRes.json();

        setStudents(Array.isArray(st) ? st : st.data || []);
        setTeachers(Array.isArray(tc) ? tc : tc.data || []);
        setClasses(Array.isArray(cl) ? cl : cl.data || []);
        setNotices(Array.isArray(nt) ? nt : nt.data || []);
        setHolidays(Array.isArray(hl) ? hl : hl.data || []);
      } else if (activeModule === 'students') {
        const [stRes, clRes] = await Promise.all([
          fetch(`${apiBaseUrl}/students`, { headers }),
          fetch(`${apiBaseUrl}/classes`, { headers }),
        ]);
        const st = await stRes.json();
        const cl = await clRes.json();
        setStudents(Array.isArray(st) ? st : st.data || []);
        setClasses(Array.isArray(cl) ? cl : cl.data || []);
      } else if (activeModule === 'teachers') {
        const res = await fetch(`${apiBaseUrl}/teachers`, { headers });
        const d = await res.json();
        setTeachers(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'classes') {
        const res = await fetch(`${apiBaseUrl}/classes`, { headers });
        const d = await res.json();
        setClasses(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'academics') {
        const res = await fetch(`${apiBaseUrl}/academic-years`, { headers });
        const d = await res.json();
        setAcademicYears(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'notices') {
        const res = await fetch(`${apiBaseUrl}/notices`, { headers });
        const d = await res.json();
        setNotices(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'holidays') {
        const res = await fetch(`${apiBaseUrl}/holidays`, { headers });
        const d = await res.json();
        setHolidays(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'exams') {
        const [exRes, stRes] = await Promise.all([
          fetch(`${apiBaseUrl}/exams`, { headers }),
          fetch(`${apiBaseUrl}/students`, { headers }),
        ]);
        const ex = await exRes.json();
        const st = await stRes.json();
        setExams(Array.isArray(ex) ? ex : ex.data || []);
        setStudents(Array.isArray(st) ? st : st.data || []);
      } else if (activeModule === 'fees') {
        const [invRes, structRes, statRes, clRes] = await Promise.all([
          fetch(`${apiBaseUrl}/fees/invoices`, { headers }),
          fetch(`${apiBaseUrl}/fees/structures`, { headers }),
          fetch(`${apiBaseUrl}/fees/stats`, { headers }),
          fetch(`${apiBaseUrl}/classes`, { headers }),
        ]);
        const inv = await invRes.json();
        const str = await structRes.json();
        const stt = await statRes.json();
        const cl = await clRes.json();

        setFeeInvoices(Array.isArray(inv) ? inv : inv.data || []);
        setFeeStructures(Array.isArray(str) ? str : str.data || []);
        setFinancialStats(stt.data || stt);
        setClasses(Array.isArray(cl) ? cl : cl.data || []);
      } else if (activeModule === 'timetables') {
        const [clRes, tcRes] = await Promise.all([
          fetch(`${apiBaseUrl}/classes`, { headers }),
          fetch(`${apiBaseUrl}/teachers`, { headers }),
        ]);
        const clData = await clRes.json();
        const tcData = await tcRes.json();
        const clsList = Array.isArray(clData) ? clData : clData.data || [];
        setClasses(clsList);
        setTeachers(Array.isArray(tcData) ? tcData : tcData.data || []);

        const targetClassId = ttSelectedClassId || (clsList.length > 0 ? clsList[0].id : '');
        if (targetClassId) {
          if (!ttSelectedClassId) setTtSelectedClassId(targetClassId);
          const ttRes = await fetch(`${apiBaseUrl}/timetables?classId=${targetClassId}&sectionId=${ttSelectedSectionId}`, { headers });
          const ttData = await ttRes.json();
          setTimetables(Array.isArray(ttData) ? ttData : ttData.data || []);
        }
      } else if (activeModule === 'school') {
        const res = await fetch(`${apiBaseUrl}/schools/me`, { headers });
        const d = await res.json();
        setSchoolInfo(d.data || d);
      }
    } catch (err) {
      console.log('Error loading admin module data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, [activeModule]);

  // Load Timetables when selected class changes
  useEffect(() => {
    if (activeModule === 'timetables' && ttSelectedClassId) {
      fetch(`${apiBaseUrl}/timetables?classId=${ttSelectedClassId}&sectionId=${ttSelectedSectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((d) => setTimetables(Array.isArray(d) ? d : d.data || []))
        .catch((err) => console.log('Error loading timetables:', err));
    }
  }, [ttSelectedClassId, ttSelectedSectionId]);

  // ==========================================
  // 1. EXCEL BULK IMPORT HANDLERS
  // ==========================================
  const loadSampleImportTemplate = () => {
    const sampleRows: BulkStudentImportRow[] = [
      {
        rowNum: 1,
        admissionNumber: 'ADM-2026-001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        gender: 'Male',
        dateOfBirth: '2015-05-15',
        admissionDate: '2026-04-01',
        rollNumber: '101',
        aadharNumber: '123456789012',
        careOfName: 'Rajesh Sharma',
        className: 'Class 1',
        sectionName: 'A',
        fatherName: 'Rajesh Sharma',
        fatherAadharNo: '987654321012',
        motherName: 'Sunita Sharma',
        motherAadharNo: '876543210987',
        mobileNo: '9876543210',
        isValid: true,
        errors: [],
      },
      {
        rowNum: 2,
        admissionNumber: 'ADM-2026-002',
        firstName: 'Ananya',
        lastName: 'Verma',
        gender: 'Female',
        dateOfBirth: '2016-08-20',
        admissionDate: '2026-04-01',
        rollNumber: '102',
        aadharNumber: '234567890123',
        careOfName: 'Suresh Verma',
        className: 'Class 2',
        sectionName: 'A',
        fatherName: 'Suresh Verma',
        fatherAadharNo: '876543210123',
        motherName: 'Priya Verma',
        motherAadharNo: '765432109876',
        mobileNo: '9123456789',
        isValid: true,
        errors: [],
      },
    ];
    setParsedImportRows(sampleRows);
    setBulkResult(null);
  };

  const handleParseRawText = () => {
    if (!importRawText.trim()) {
      alert('कृपया एक्सेल / CSV का टेक्स्ट या डाटा पेस्ट करें।');
      return;
    }

    try {
      const lines = importRawText.trim().split('\n');
      const rows: BulkStudentImportRow[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(/,|\t/).map((p) => p.trim());
        if (parts.length === 0 || !parts[0]) return;

        const admNo = parts[0] || `ADM-${Date.now()}-${idx + 1}`;
        const fNameVal = parts[1] || 'Student';
        const lNameVal = parts[2] || 'Record';
        const gdr = parts[3] || 'Male';
        const dob = parts[4] || '';
        const roll = parts[5] || `${100 + idx}`;
        const mob = parts[6] || '9876543210';
        const cls = parts[7] || 'Class 1';

        const rowErrors: string[] = [];
        if (!fNameVal) rowErrors.push('पहला नाम आवश्यक है');
        if (!admNo) rowErrors.push('SR No. आवश्यक है');

        rows.push({
          rowNum: idx + 1,
          admissionNumber: admNo,
          firstName: fNameVal,
          lastName: lNameVal,
          gender: gdr,
          dateOfBirth: dob,
          rollNumber: roll,
          mobileNo: mob,
          className: cls,
          isValid: rowErrors.length === 0,
          errors: rowErrors,
        });
      });

      if (rows.length === 0) {
        alert('कोई वैध पंक्तियाँ (rows) नहीं पाई गईं।');
        return;
      }

      setParsedImportRows(rows);
      setBulkResult(null);
    } catch (err: any) {
      alert('पार्स करने में त्रुटि: ' + err.message);
    }
  };

  const handleSubmitBulkStudents = async () => {
    const validRows = parsedImportRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('सबमिट करने के लिए कोई वैध रिकॉर्ड नहीं है।');
      return;
    }

    setBulkUploading(true);
    setBulkResult(null);

    const mappedPayload = validRows.map((r) => {
      let targetClassId: string | undefined;
      let targetSectionId: string | undefined;

      if (r.className) {
        const foundCls = classes.find((c) => c.name.toLowerCase() === r.className?.toLowerCase());
        if (foundCls) {
          targetClassId = foundCls.id;
          if (r.sectionName && foundCls.sections) {
            const foundSec = foundCls.sections.find((s) => s.name.toLowerCase() === r.sectionName?.toLowerCase());
            if (foundSec) targetSectionId = foundSec.id;
          }
        }
      }

      return {
        admissionNumber: r.admissionNumber,
        firstName: r.firstName,
        lastName: r.lastName,
        gender: r.gender || 'Male',
        dateOfBirth: r.dateOfBirth || undefined,
        admissionDate: r.admissionDate || undefined,
        rollNumber: r.rollNumber || undefined,
        aadharNumber: r.aadharNumber || undefined,
        careOfName: r.careOfName || undefined,
        classId: targetClassId,
        sectionId: targetSectionId,
        fatherName: r.fatherName || undefined,
        fatherAadharNo: r.fatherAadharNo || undefined,
        motherName: r.motherName || undefined,
        motherAadharNo: r.motherAadharNo || undefined,
        mobileNo: r.mobileNo || undefined,
      };
    });

    try {
      const res = await fetch(`${apiBaseUrl}/students/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ students: mappedPayload }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'थोक छात्र इम्पोर्ट विफल');

      const createdCount = resData.data?.createdCount || resData.createdCount || validRows.length;
      setBulkResult({
        successCount: createdCount,
        failureCount: parsedImportRows.length - validRows.length,
        message: `${createdCount} छात्रों को सफलतापूर्वक इम्पोर्ट किया गया!`,
      });

      loadModuleData();
    } catch (err: any) {
      alert(err.message || 'इम्पोर्ट विफल रहा');
    } finally {
      setBulkUploading(false);
    }
  };

  // ==========================================
  // 2. REPORT CARD HANDLERS
  // ==========================================
  const handleFetchReportCard = async (studentId: string) => {
    setSelectedReportStudentId(studentId);
    setLoadingReportCard(true);
    setShowReportCardModal(true);

    try {
      const res = await fetch(`${apiBaseUrl}/exams/report-card/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'रिपोर्ट कार्ड प्राप्त करने में विफल');

      setReportCardData(resData.data || resData);
    } catch (err: any) {
      alert(err.message || 'रिपोर्ट कार्ड प्राप्त करने में त्रुटि');
    } finally {
      setLoadingReportCard(false);
    }
  };

  const handlePrintReportCard = () => {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    } else {
      alert('प्रिंटिंग आपके प्लेटफ़ॉर्म पर समर्थित है (Print window requested)');
    }
  };

  // ==========================================
  // 3. FEE BILLING HANDLERS
  // ==========================================
  const handleCreateFeeStructure = async () => {
    if (!feeStructName || !feeStructAmount || !feeStructDueDate) {
      return alert('नाम, राशि और देय तिथि (Due Date) आवश्यक हैं।');
    }

    setSubmitting(true);
    try {
      const yearRes = await fetch(`${apiBaseUrl}/academic-years`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const years = await yearRes.json();
      const currentYear = Array.isArray(years) ? (years.find((y: any) => y.isCurrent) || years[0]) : years[0];

      const res = await fetch(`${apiBaseUrl}/fees/structures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: feeStructName,
          amount: Number(feeStructAmount),
          dueDate: feeStructDueDate,
          description: feeStructDesc,
          academicYearId: currentYear?.id,
        }),
      });

      if (!res.ok) throw new Error('शुल्क संरचना बनाने में विफल');
      alert('शुल्क संरचना सफलतापूर्वक बनाई गई!');
      setShowFeeStructureModal(false);
      setFeeStructName('');
      loadModuleData();
    } catch (err: any) {
      alert(err.message || 'शुल्क संरचना बनाने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!selectedFeeStructureId) return alert('कृपया एक शुल्क संरचना चुनें।');

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/fees/invoices/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feeStructureId: selectedFeeStructureId,
          classId: selectedFeeClassId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'चालान (Invoices) जनरेट करने में विफल');

      alert(`सफलतापूर्वक ${data.generatedCount || data.data?.generatedCount || 'सारे'} चालान जनरेट किए गए!`);
      setShowGenerateInvoicesModal(false);
      loadModuleData();
    } catch (err: any) {
      alert(err.message || 'चालान जनरेट करने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return alert('भुगतान राशि दर्ज करें।');

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/fees/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amountPaid: Number(paymentAmount),
          paymentMethod,
          transactionRef: paymentRef || undefined,
        }),
      });

      if (!res.ok) throw new Error('भुगतान दर्ज करने में विफल');
      alert('शुल्क भुगतान सफलतापूर्वक दर्ज किया गया!');
      setShowRecordPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      setPaymentRef('');
      loadModuleData();
    } catch (err: any) {
      alert(err.message || 'भुगतान दर्ज करने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // 4. TIMETABLE HANDLERS
  // ==========================================
  const handleAddTimetablePeriod = async () => {
    if (!ttSelectedClassId || !ttSubjectName || !ttStartTime || !ttEndTime) {
      return alert('कक्षा, विषय और समय आवश्यक हैं।');
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/timetables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: ttSelectedClassId,
          sectionId: ttSelectedSectionId || undefined,
          teacherId: ttTeacherId || undefined,
          dayOfWeek: ttDayOfWeek,
          startTime: ttStartTime,
          endTime: ttEndTime,
          subjectName: ttSubjectName,
          roomNumber: ttRoomNumber || undefined,
        }),
      });

      if (!res.ok) throw new Error('समय सारणी पीरियड जोड़ने में विफल');
      alert('समय सारणी में नया पीरियड जोड़ा गया!');
      setShowTtModal(false);
      loadModuleData();
    } catch (err: any) {
      alert(err.message || 'पीरियड जोड़ने में त्रुटि');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTimetablePeriod = async (periodId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/timetables/${periodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('पीरियड हटाने में विफलता');
      loadModuleData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Form Handlers for Single Add
  const handleAddStudent = async () => {
    if (!fName || !lName) return alert('प्रथम व अंतिम नाम आवश्यक हैं।');
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: fName, lastName: lName, rollNumber: fRoll, admissionNumber: `ADM-${Date.now()}` }),
      });
      if (!res.ok) throw new Error('छात्र जोड़ने में विफल');
      alert('छात्र सफलतापूर्वक जोड़ा गया!');
      setShowForm(false);
      resetForm();
      loadModuleData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!fName || !lName || !fEmail) return alert('नाम और ईमेल आवश्यक हैं।');
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: fName, lastName: lName, email: fEmail, phone: fPhone }),
      });
      if (!res.ok) throw new Error('शिक्षक जोड़ने में विफल');
      alert('शिक्षक सफलतापूर्वक जोड़ा गया!');
      setShowForm(false);
      resetForm();
      loadModuleData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNotice = async () => {
    if (!fTitle || !fDesc) return alert('शीर्षक और विवरण आवश्यक हैं।');
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: fTitle,
          category: fCategory,
          description: fDesc,
          date: fDate,
          isPublic: true,
        }),
      });
      if (!res.ok) throw new Error('नोटिस जोड़ने में विफल');
      alert('नोटिस सफलतापूर्वक जोड़ा गया!');
      setShowForm(false);
      resetForm();
      refreshPublicData();
      loadModuleData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (endpoint: string, id: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('हटाने में विफलता');
      loadModuleData();
      refreshPublicData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFName('');
    setLName('');
    setFEmail('');
    setFPhone('');
    setFRoll('');
    setFTitle('');
    setFDesc('');
  };

  const modulesList: { key: AdminModule; label: string; icon: string }[] = [
    { key: 'overview', label: 'डैशबोर्ड', icon: '📊' },
    { key: 'students', label: 'विद्यार्थी', icon: '👨‍🎓' },
    { key: 'teachers', label: 'शिक्षक', icon: '👨‍🏫' },
    { key: 'classes', label: 'कक्षाएँ', icon: '📚' },
    { key: 'academics', label: 'सत्र (Academic)', icon: '📅' },
    { key: 'attendance', label: 'उपस्थिति', icon: '✅' },
    { key: 'exams', label: 'परीक्षाएँ', icon: '🏆' },
    { key: 'fees', label: 'शुल्क (Fees)', icon: '💳' },
    { key: 'timetables', label: 'समय-सारणी', icon: '⏰' },
    { key: 'notices', label: 'नोटिस बोर्ड', icon: '📢' },
    { key: 'holidays', label: 'अवकाश सूची', icon: '🌴' },
    { key: 'school', label: 'स्कूल प्रोफाइल', icon: '🏫' },
  ];

  const currentModuleObj = modulesList.find((m) => m.key === activeModule) || modulesList[0];

  return (
    <View style={styles.container}>
      {/* Compact Mobile Header */}
      <View style={styles.compactHeader}>
        <TouchableOpacity style={styles.hamburgerBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSchoolTitle}>School Admin</Text>
          <Text style={styles.headerSubTitle}>
            {user.firstName || 'प्रशासक'} • {currentModuleObj.label}
          </Text>
        </View>

        <TouchableOpacity style={styles.compactLogoutBtn} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Drawer Modal */}
      <Modal animationType="fade" transparent={true} visible={drawerOpen} onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerBackdrop}>
          <SafeAreaView style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <View>
                <View style={styles.drawerBadge}>
                  <Text style={styles.drawerBadgeText}>SCHOOL ADMIN</Text>
                </View>
                <Text style={styles.drawerUserName}>
                  {user.firstName || 'प्रशासक'} {user.lastName || 'एडमिन'}
                </Text>
                <Text style={styles.drawerUserEmail}>{user.email}</Text>
              </View>

              <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerMenuList} showsVerticalScrollIndicator={true}>
              <Text style={styles.drawerSectionHeading}>प्रशासनिक मॉड्यूल (MODULES)</Text>
              {modulesList.map((m) => {
                const isActive = activeModule === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.drawerMenuItem, isActive && styles.activeDrawerMenuItem]}
                    onPress={() => {
                      setActiveModule(m.key);
                      setDrawerOpen(false);
                      setShowForm(false);
                    }}
                  >
                    <Text style={styles.drawerMenuIcon}>{m.icon}</Text>
                    <Text style={[styles.drawerMenuLabel, isActive && styles.activeDrawerMenuLabel]}>{m.label}</Text>
                    {isActive && <Text style={styles.activeCheckMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.drawerLogoutFooter} onPress={onLogout}>
              <Text style={styles.drawerLogoutText}>🚪 लॉगआउट (Sign Out)</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <TouchableOpacity style={styles.drawerOverlayTouchable} activeOpacity={1} onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>

      {/* Main Content Area */}
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* OVERVIEW / DASHBOARD */}
            {activeModule === 'overview' && (
              <View style={styles.section}>
                <View style={styles.welcomeCard}>
                  <Text style={styles.welcomeGreeting}>नमस्ते, {user.firstName || 'Admin'} 👋</Text>
                  <Text style={styles.welcomeSub}>यू.पी.एस. तैय्यबपुर बढ़ा - एडमिन डैशबोर्ड में आपका स्वागत है।</Text>
                </View>

                <Text style={styles.sectionTitle}>📊 डैशबोर्ड आंकड़े</Text>

                <View style={styles.statsGrid}>
                  <TouchableOpacity style={styles.statBox} onPress={() => setActiveModule('students')}>
                    <Text style={styles.statIcon}>👨‍🎓</Text>
                    <Text style={styles.statNum}>{students.length}</Text>
                    <Text style={styles.statTitle}>विद्यार्थी</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.statBox} onPress={() => setActiveModule('teachers')}>
                    <Text style={styles.statIcon}>👨‍🏫</Text>
                    <Text style={styles.statNum}>{teachers.length}</Text>
                    <Text style={styles.statTitle}>शिक्षक</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.statBox} onPress={() => setActiveModule('classes')}>
                    <Text style={styles.statIcon}>📚</Text>
                    <Text style={styles.statNum}>{classes.length}</Text>
                    <Text style={styles.statTitle}>कक्षाएं</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.statBox} onPress={() => setActiveModule('notices')}>
                    <Text style={styles.statIcon}>📢</Text>
                    <Text style={styles.statNum}>{notices.length}</Text>
                    <Text style={styles.statTitle}>नोटिस</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STUDENTS MODULE (WITH EXCEL BULK IMPORT) */}
            {activeModule === 'students' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>🎓 विद्यार्थी ({students.length})</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#166534' }]} onPress={() => setShowBulkModal(true)}>
                      <Text style={[styles.addBtnText, { color: '#FFFFFF' }]}>📥 Excel इम्पोर्ट</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                      <Text style={styles.addBtnText}>{showForm ? '✖ बंद' : '➕ नया छात्र'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {showForm && (
                  <View style={styles.formCard}>
                    <Text style={styles.formHeader}>नया विद्यार्थी जोड़ें</Text>
                    <TextInput style={styles.input} placeholder="पहला नाम (First Name)" value={fName} onChangeText={setFName} />
                    <TextInput style={styles.input} placeholder="अंतिम नाम (Last Name)" value={lName} onChangeText={setLName} />
                    <TextInput style={styles.input} placeholder="अनुक्रमांक / रोल नंबर" value={fRoll} onChangeText={setFRoll} />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleAddStudent} disabled={submitting}>
                      <Text style={styles.submitBtnText}>{submitting ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {students.length === 0 ? (
                  <Text style={styles.empty}>कोई विद्यार्थी पंजीकृत नहीं है।</Text>
                ) : (
                  students.map((st) => (
                    <View key={st.id} style={styles.card}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>{st.firstName} {st.lastName}</Text>
                        <TouchableOpacity style={styles.miniBtn} onPress={() => handleFetchReportCard(st.id)}>
                          <Text style={styles.miniBtnText}>📄 रिपोर्ट कार्ड</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cardSub}>
                        SR No: {st.admissionNumber || st.admissionNo || 'ADM-01'} | रोल नंबर: {st.rollNumber || 'N/A'} | कक्षा: {st.class?.name || 'Class 1'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* EXAMS MODULE (WITH PDF REPORT CARDS) */}
            {activeModule === 'exams' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 परीक्षा एवं परिणाम प्रबंधन</Text>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>विद्यार्थी ट्रांसक्रिप्ट / रिपोर्ट कार्ड जनरेट करें</Text>
                  <Text style={styles.cardSub}>छात्र चुनें और अंकतालिका रिपोर्ट देखें या प्रिंट करें:</Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {students.slice(0, 8).map((st) => (
                        <TouchableOpacity
                          key={st.id}
                          style={styles.chipBtn}
                          onPress={() => handleFetchReportCard(st.id)}
                        >
                          <Text style={styles.chipBtnText}>📄 {st.firstName} {st.lastName}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {exams.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>वार्षिक परीक्षा समय सारणी 2026</Text>
                    <Text style={styles.cardSub}>कक्षा 1 से 8 की मुख्य परीक्षाएं</Text>
                  </View>
                ) : (
                  exams.map((e) => (
                    <View key={e.id} style={styles.card}>
                      <Text style={styles.cardTitle}>{e.name}</Text>
                      <Text style={styles.cardSub}>सत्र: {e.academicYear?.name || 'Current'} | स्टेटस: {e.status || 'ACTIVE'}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* FEES MODULE (FULL BILLING & STRUCTURES) */}
            {activeModule === 'fees' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>💳 शुल्क एवं चालान (Fees & Billing)</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowFeeStructureModal(true)}>
                    <Text style={styles.addBtnText}>➕ नई शुल्क संरचना</Text>
                  </TouchableOpacity>
                </View>

                {/* Financial Summary Stats Cards */}
                {financialStats && (
                  <View style={styles.statsGrid}>
                    <View style={[styles.statBox, { borderColor: '#1E3A8A' }]}>
                      <Text style={styles.statNum}>₹{financialStats.totalBilled}</Text>
                      <Text style={styles.statTitle}>कुल बिल (Billed)</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: '#166534' }]}>
                      <Text style={styles.statNum}>₹{financialStats.totalCollected}</Text>
                      <Text style={styles.statTitle}>प्राप्त शुल्क (Collected)</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: '#DC2626' }]}>
                      <Text style={styles.statNum}>₹{financialStats.pendingDues}</Text>
                      <Text style={styles.statTitle}>बकाया (Pending Dues)</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNum}>{financialStats.paidInvoicesCount} / {financialStats.totalInvoicesCount}</Text>
                      <Text style={styles.statTitle}>भुगतान चालान</Text>
                    </View>
                  </View>
                )}

                {/* Sub Tab Switcher */}
                <View style={styles.tabBar}>
                  <TouchableOpacity
                    style={[styles.tabItem, feesSubTab === 'invoices' && styles.activeTabItem]}
                    onPress={() => setFeesSubTab('invoices')}
                  >
                    <Text style={[styles.tabText, feesSubTab === 'invoices' && styles.activeTabText]}>
                      📜 चालान (Invoices)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabItem, feesSubTab === 'structures' && styles.activeTabItem]}
                    onPress={() => setFeesSubTab('structures')}
                  >
                    <Text style={[styles.tabText, feesSubTab === 'structures' && styles.activeTabText]}>
                      📑 शुल्क संरचनाएं
                    </Text>
                  </TouchableOpacity>
                </View>

                {feesSubTab === 'invoices' && (
                  <View style={{ gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: '#1E3A8A' }]}
                      onPress={() => setShowGenerateInvoicesModal(true)}
                    >
                      <Text style={styles.submitBtnText}>⚡ थोक चालान (Generate Invoices)</Text>
                    </TouchableOpacity>

                    {feeInvoices.length === 0 ? (
                      <Text style={styles.empty}>कोई चालान जारी नहीं किया गया है।</Text>
                    ) : (
                      feeInvoices.map((inv) => (
                        <View key={inv.id} style={styles.card}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.cardTitle}>{inv.student?.firstName} {inv.student?.lastName}</Text>
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '900',
                                color: inv.status === 'PAID' ? '#166534' : '#DC2626',
                              }}
                            >
                              {inv.status}
                            </Text>
                          </View>
                          <Text style={styles.cardSub}>
                            चालान #: {inv.invoiceNumber || inv.id.slice(0, 8)} | कुल: ₹{inv.totalAmount} | जमा: ₹{inv.paidAmount}
                          </Text>
                          {inv.status !== 'PAID' && (
                            <TouchableOpacity
                              style={[styles.miniBtn, { alignSelf: 'flex-start', marginTop: 4 }]}
                              onPress={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(String(inv.totalAmount - inv.paidAmount));
                                setShowRecordPaymentModal(true);
                              }}
                            >
                              <Text style={styles.miniBtnText}>💵 शुल्क जमा करें (Record Payment)</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                )}

                {feesSubTab === 'structures' && (
                  <View style={{ gap: 8 }}>
                    {feeStructures.length === 0 ? (
                      <Text style={styles.empty}>कोई शुल्क संरचना दर्ज नहीं है।</Text>
                    ) : (
                      feeStructures.map((st) => (
                        <View key={st.id} style={styles.card}>
                          <Text style={styles.cardTitle}>{st.name}</Text>
                          <Text style={styles.cardSub}>राशि: ₹{st.amount} | देय तिथि: {new Date(st.dueDate).toLocaleDateString()}</Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}

            {/* TIMETABLES MODULE (FULL EDITING) */}
            {activeModule === 'timetables' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>⏰ समय सारणी प्रबंधन</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowTtModal(true)}>
                    <Text style={styles.addBtnText}>➕ नया पीरियड</Text>
                  </TouchableOpacity>
                </View>

                {/* Class Selector Dropdown / Chips */}
                <Text style={styles.subHeader}>कक्षा चुनें:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {classes.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[styles.chipBtn, ttSelectedClassId === cls.id && styles.activeChipBtn]}
                        onPress={() => setTtSelectedClassId(cls.id)}
                      >
                        <Text style={[styles.chipBtnText, ttSelectedClassId === cls.id && styles.activeChipBtnText]}>
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {timetables.length === 0 ? (
                  <Text style={styles.empty}>इस कक्षा की समय सारणी में कोई पीरियड नहीं है।</Text>
                ) : (
                  timetables.map((tt) => (
                    <View key={tt.id} style={styles.card}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>{tt.dayOfWeek} — {tt.subjectName}</Text>
                        <TouchableOpacity onPress={() => handleDeleteTimetablePeriod(tt.id)}>
                          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>🗑️ डिलीट</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cardSub}>
                        समय: {tt.startTime} से {tt.endTime} | कक्ष: {tt.roomNumber || 'Room 101'} | शिक्षक: {tt.teacher ? `${tt.teacher.firstName} ${tt.teacher.lastName}` : 'N/A'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TEACHERS / CLASSES / NOTICES / HOLIDAYS / SCHOOL */}
            {activeModule === 'teachers' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>👨‍🏫 शिक्षक ({teachers.length})</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtnText}>{showForm ? '✖ बंद' : '➕ नया शिक्षक'}</Text>
                  </TouchableOpacity>
                </View>

                {showForm && (
                  <View style={styles.formCard}>
                    <Text style={styles.formHeader}>नया शिक्षक जोड़ें</Text>
                    <TextInput style={styles.input} placeholder="प्रथम नाम" value={fName} onChangeText={setFName} />
                    <TextInput style={styles.input} placeholder="अंतिम नाम" value={lName} onChangeText={setLName} />
                    <TextInput style={styles.input} placeholder="ईमेल" value={fEmail} onChangeText={setFEmail} keyboardType="email-address" autoCapitalize="none" />
                    <TextInput style={styles.input} placeholder="फोन नंबर" value={fPhone} onChangeText={setFPhone} keyboardType="phone-pad" />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleAddTeacher} disabled={submitting}>
                      <Text style={styles.submitBtnText}>{submitting ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {teachers.map((tc) => (
                  <View key={tc.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{tc.firstName} {tc.lastName}</Text>
                    <Text style={styles.cardSub}>ईमेल: {tc.email} | फोन: {tc.phone || 'N/A'}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'classes' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 कक्षाएं एवं सेक्शन ({classes.length})</Text>
                {classes.map((c) => (
                  <View key={c.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{c.name}</Text>
                    <Text style={styles.cardSub}>कोड: {c.code || c.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'notices' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>📢 नोटिस बोर्ड ({notices.length})</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtnText}>{showForm ? '✖ बंद' : '➕ नया नोटिस'}</Text>
                  </TouchableOpacity>
                </View>

                {showForm && (
                  <View style={styles.formCard}>
                    <Text style={styles.formHeader}>नया नोटिस प्रकाशित करें</Text>
                    <TextInput style={styles.input} placeholder="नोटिस शीर्षक" value={fTitle} onChangeText={setFTitle} />
                    <TextInput style={[styles.input, { height: 70 }]} placeholder="विवरण लिखें..." value={fDesc} onChangeText={setFDesc} multiline />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleAddNotice} disabled={submitting}>
                      <Text style={styles.submitBtnText}>{submitting ? 'प्रकाशित हो रहा है...' : 'प्रकाशित करें'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {notices.map((n) => (
                  <View key={n.id} style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.cardTitle}>{n.title}</Text>
                      <TouchableOpacity onPress={() => handleDeleteItem('notices', n.id)}>
                        <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>🗑️ डिलीट</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardDesc}>{n.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'holidays' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌴 अवकाश सूची ({holidays.length})</Text>
                {holidays.map((h) => (
                  <View key={h.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{h.title}</Text>
                    <Text style={styles.cardSub}>दिनांक: {h.startDate} से {h.endDate}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'school' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏫 विद्यालय विवरण</Text>
                <View style={styles.compactSchoolCard}>
                  <Text style={styles.schoolCardTitle}>UPS Taiyyabpur Badha</Text>
                  <Text style={styles.schoolCardUdise}>UDISE: 09011101603</Text>
                  <Text style={styles.schoolCardDetail}>📍 ग्राम: तैय्यबपुर बड़हा, नागल, सहारनपुर (उ.प्र.)</Text>
                  <Text style={styles.schoolCardDetail}>☎ 9058347719</Text>
                  <Text style={styles.schoolCardDetail}>प्रधानाध्यापक: संजय कुमार</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ========================================== */}
      {/* 1. EXCEL BULK IMPORT MODAL */}
      {/* ========================================== */}
      <Modal visible={showBulkModal} animationType="slide" onRequestClose={() => setShowBulkModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F0' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📥 Excel छात्र थोक इम्पोर्ट</Text>
            <TouchableOpacity onPress={() => setShowBulkModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 14 }}>
            <Text style={styles.cardDesc}>
              एक्सेल की पंक्तियाँ (CSV / Tabular format) नीचे पेस्ट करें या नमूना (Sample Template) लोड करें:
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#1E3A8A' }]} onPress={loadSampleImportTemplate}>
                <Text style={styles.miniBtnText}>📄 नमूना टेम्पलेट भरें</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.miniBtn, { backgroundColor: '#166534' }]} onPress={handleParseRawText}>
                <Text style={styles.miniBtnText}>🔍 पार्स करें (Parse Text)</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { height: 100, fontSize: 11 }]}
              placeholder="ADM-001, Rahul, Sharma, Male, 2015-05-15, 101, 9876543210, Class 1"
              value={importRawText}
              onChangeText={setImportRawText}
              multiline
            />

            {parsedImportRows.length > 0 && (
              <View style={{ marginTop: 12, gap: 8 }}>
                <Text style={styles.subHeader}>
                  पूर्वावलोकन (Preview Rows - {parsedImportRows.length}):
                </Text>

                {parsedImportRows.map((r) => (
                  <View
                    key={r.rowNum}
                    style={[
                      styles.card,
                      { borderLeftWidth: 4, borderLeftColor: r.isValid ? '#166534' : '#DC2626' },
                    ]}
                  >
                    <Text style={styles.cardTitle}>
                      #{r.rowNum} — {r.firstName} {r.lastName} ({r.admissionNumber})
                    </Text>
                    <Text style={styles.cardSub}>
                      कक्षा: {r.className} | रोल: {r.rollNumber} | मोबाइल: {r.mobileNo}
                    </Text>
                    {r.errors.length > 0 && (
                      <Text style={{ color: '#DC2626', fontSize: 11 }}>⚠ {r.errors.join(', ')}</Text>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: '#166534', marginTop: 8 }]}
                  onPress={handleSubmitBulkStudents}
                  disabled={bulkUploading}
                >
                  <Text style={styles.submitBtnText}>
                    {bulkUploading ? 'इम्पोर्ट हो रहा है...' : '🚀 वैध रिकॉर्ड्स सबमिट करें'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {bulkResult && (
              <View style={[styles.welcomeCard, { marginTop: 12, borderLeftColor: '#166534' }]}>
                <Text style={styles.welcomeGreeting}>इम्पोर्ट परिणाम:</Text>
                <Text style={styles.welcomeSub}>{bulkResult.message}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 2. REPORT CARD MODAL */}
      {/* ========================================== */}
      <Modal visible={showReportCardModal} animationType="slide" onRequestClose={() => setShowReportCardModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📄 विद्यार्थी अंकतालिका (Report Card)</Text>
            <TouchableOpacity onPress={() => setShowReportCardModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {loadingReportCard ? (
            <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 40 }} />
          ) : reportCardData ? (
            <ScrollView style={{ padding: 16 }}>
              {/* Header Certificate Style */}
              <View style={styles.reportHeaderBox}>
                <Text style={styles.reportSchoolName}>UPS TAIYYABPUR BADHA</Text>
                <Text style={styles.reportSchoolSub}>उच्च प्राथमिक विद्यालय तैय्यबपुर बढ़ा, नागल, सहारनपुर</Text>
                <Text style={styles.reportDocTitle}>ACADEMIC TRANSCRIPT / 📄 प्रगति पत्रक</Text>
              </View>

              {/* Student Profile Box */}
              <View style={styles.reportProfileGrid}>
                <Text style={styles.reportProfileText}> विद्यार्थी का नाम: <Text style={{ fontWeight: 'bold' }}>{reportCardData.student.name}</Text></Text>
                <Text style={styles.reportProfileText}> SR No / प्रवेश सं.: <Text style={{ fontWeight: 'bold' }}>{reportCardData.student.admissionNumber}</Text></Text>
                <Text style={styles.reportProfileText}> कक्षा: <Text style={{ fontWeight: 'bold' }}>{reportCardData.student.className} ({reportCardData.student.sectionName})</Text></Text>
              </View>

              {/* Subject Results Table */}
              <Text style={[styles.subHeader, { marginTop: 12 }]}>विषयवार प्राप्तांक Details:</Text>
              {reportCardData.results.map((r, idx) => (
                <View key={idx} style={styles.resultRow}>
                  <Text style={{ fontWeight: 'bold', fontSize: 13, flex: 1 }}>{r.subjectName}</Text>
                  <Text style={{ fontSize: 12 }}>{r.marksObtained} / {r.maxMarks}</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#1E3A8A', width: 40, textAlign: 'right' }}>{r.grade}</Text>
                </View>
              ))}

              {/* Summary Grade Box */}
              <View style={styles.reportSummaryCard}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }}>
                  कुल प्राप्तांक: {reportCardData.summary.totalObtained} / {reportCardData.summary.totalMax}
                </Text>
                <Text style={{ color: '#D4A84F', fontWeight: 'bold', fontSize: 14 }}>
                  प्रतिशत: {reportCardData.summary.percentage}% | ग्रेड: {reportCardData.summary.overallGrade}
                </Text>
              </View>

              <TouchableOpacity style={[styles.submitBtn, { marginVertical: 16 }]} onPress={handlePrintReportCard}>
                <Text style={styles.submitBtnText}>🖨️ रिपोर्ट कार्ड प्रिंट / शेयर करें</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text style={{ padding: 20, color: '#64748B' }}>रिपोर्ट कार्ड उपलब्ध नहीं है।</Text>
          )}
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 3. FEE STRUCTURE CREATION MODAL */}
      {/* ========================================== */}
      <Modal visible={showFeeStructureModal} animationType="slide" onRequestClose={() => setShowFeeStructureModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F0' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>➕ नई शुल्क संरचना बनाएं</Text>
            <TouchableOpacity onPress={() => setShowFeeStructureModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <TextInput style={styles.input} placeholder="शुल्क शीर्षक (उदा. Annual Tuition Fee)" value={feeStructName} onChangeText={setFeeStructName} />
            <TextInput style={styles.input} placeholder="राशि (Amount in ₹)" value={feeStructAmount} onChangeText={setFeeStructAmount} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="देय तिथि (YYYY-MM-DD)" value={feeStructDueDate} onChangeText={setFeeStructDueDate} />
            <TextInput style={styles.input} placeholder="विवरण (Description)" value={feeStructDesc} onChangeText={setFeeStructDesc} />
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateFeeStructure} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'सहेज रहे हैं...' : 'संरचना सहेजें'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* GENERATE BATCH INVOICES MODAL */}
      <Modal visible={showGenerateInvoicesModal} animationType="slide" onRequestClose={() => setShowGenerateInvoicesModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F0' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⚡ थोक चालान जनरेट करें</Text>
            <TouchableOpacity onPress={() => setShowGenerateInvoicesModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <Text style={styles.subHeader}>शुल्क संरचना चुनें:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {feeStructures.map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={[styles.chipBtn, selectedFeeStructureId === st.id && styles.activeChipBtn]}
                    onPress={() => setSelectedFeeStructureId(st.id)}
                  >
                    <Text style={[styles.chipBtnText, selectedFeeStructureId === st.id && styles.activeChipBtnText]}>
                      {st.name} (₹{st.amount})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.submitBtn, { marginTop: 16 }]} onPress={handleGenerateInvoices} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'जनरेट हो रहा है...' : 'चालान जारी करें'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal visible={showRecordPaymentModal} animationType="slide" onRequestClose={() => setShowRecordPaymentModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F0' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💵 शुल्क भुगतान दर्ज करें</Text>
            <TouchableOpacity onPress={() => setShowRecordPaymentModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <Text style={styles.cardTitle}>
              विद्यार्थी: {selectedInvoice?.student?.firstName} {selectedInvoice?.student?.lastName}
            </Text>
            <TextInput style={styles.input} placeholder="भुगतान की गई राशि (₹)" value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="भुगतान विधि (ONLINE / CASH)" value={paymentMethod} onChangeText={setPaymentMethod} />
            <TextInput style={styles.input} placeholder="ट्रांजैक्शन संदर्भ नंबर (Optional)" value={paymentRef} onChangeText={setPaymentRef} />
            <TouchableOpacity style={styles.submitBtn} onPress={handleRecordPayment} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'दर्ज हो रहा है...' : 'भुगतान रसीद जमा करें'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================== */}
      {/* 4. TIMETABLE PERIOD SLOT MODAL */}
      {/* ========================================== */}
      <Modal visible={showTtModal} animationType="slide" onRequestClose={() => setShowTtModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F6F0' }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>⏰ समय सारणी में नया पीरियड जोड़ें</Text>
            <TouchableOpacity onPress={() => setShowTtModal(false)}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <TextInput style={styles.input} placeholder="दिन (MONDAY, TUESDAY...)" value={ttDayOfWeek} onChangeText={setTtDayOfWeek} />
            <TextInput style={styles.input} placeholder="विषय का नाम (Subject Name)" value={ttSubjectName} onChangeText={setTtSubjectName} />
            <TextInput style={styles.input} placeholder="प्रारंभ समय (e.g. 09:00)" value={ttStartTime} onChangeText={setTtStartTime} />
            <TextInput style={styles.input} placeholder="समाप्ति समय (e.g. 09:45)" value={ttEndTime} onChangeText={setTtEndTime} />
            <TextInput style={styles.input} placeholder="कमरा नंबर (e.g. Room 101)" value={ttRoomNumber} onChangeText={setTtRoomNumber} />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddTimetablePeriod} disabled={submitting}>
              <Text style={styles.submitBtnText}>{submitting ? 'सहेज रहे हैं...' : 'पीरियड जोड़ें'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  compactHeader: {
    backgroundColor: '#0B1F3A',
    height: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A84F',
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1E3A8A',
  },
  hamburgerIcon: {
    color: '#D4A84F',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerSchoolTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  headerSubTitle: {
    color: '#D4A84F',
    fontSize: 11,
    fontWeight: '700',
  },
  compactLogoutBtn: {
    width: 38,
    height: 38,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 16,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.75)',
    flexDirection: 'row',
  },
  drawerOverlayTouchable: {
    flex: 1,
  },
  drawerContainer: {
    width: 280,
    maxHeight: '100%',
    backgroundColor: '#0B1F3A',
    borderRightWidth: 2,
    borderRightColor: '#D4A84F',
  },
  drawerHeader: {
    padding: 16,
    backgroundColor: '#071527',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  drawerBadge: {
    backgroundColor: '#D4A84F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  drawerBadgeText: {
    color: '#0B1F3A',
    fontSize: 9,
    fontWeight: '900',
  },
  drawerUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  drawerUserEmail: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  drawerMenuList: {
    flex: 1,
    paddingVertical: 8,
  },
  drawerSectionHeading: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    letterSpacing: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  activeDrawerMenuItem: {
    backgroundColor: '#1E3A8A',
    borderLeftColor: '#D4A84F',
  },
  drawerMenuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  drawerMenuLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  activeDrawerMenuLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  activeCheckMark: {
    color: '#D4A84F',
    fontWeight: 'bold',
    fontSize: 14,
  },
  drawerLogoutFooter: {
    backgroundColor: '#DC2626',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawerLogoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  welcomeCard: {
    backgroundColor: '#0B1F3A',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A84F',
    marginBottom: 14,
  },
  welcomeGreeting: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  welcomeSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  addBtn: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#D4A84F',
    fontWeight: '800',
    fontSize: 12,
  },
  miniBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4A84F',
    gap: 8,
  },
  formHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#0B1F3A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  statTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
  },
  cardDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  compactSchoolCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4A84F',
    borderLeftWidth: 4,
    borderLeftColor: '#0B1F3A',
    gap: 4,
  },
  schoolCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  schoolCardUdise: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4A84F',
    marginBottom: 4,
  },
  schoolCardDetail: {
    fontSize: 12,
    color: '#334155',
  },
  empty: {
    color: '#64748B',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
    marginVertical: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabItem: {
    backgroundColor: '#0B1F3A',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chipBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeChipBtn: {
    backgroundColor: '#0B1F3A',
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  activeChipBtnText: {
    color: '#FFFFFF',
  },
  modalHeader: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  reportHeaderBox: {
    backgroundColor: '#0B1F3A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  reportSchoolName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  reportSchoolSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  reportDocTitle: {
    color: '#D4A84F',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  reportProfileGrid: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  reportProfileText: {
    fontSize: 12,
    color: '#334155',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reportSummaryCard: {
    backgroundColor: '#0B1F3A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
});
