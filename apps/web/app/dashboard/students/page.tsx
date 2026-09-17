'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { GraduationCap, Plus, Search, User, Phone, Mail, BookOpen, Loader2, AlertCircle, Edit, Trash2, Calendar, FileText, Users, Eye, X, Upload, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ClassItem {
  id: string;
  name: string;
  sections?: { id: string; name: string }[];
}

interface Student {
  id: string;
  admissionNumber: string; // 1. SR No / Admission No
  firstName: string;       // 2. Student Name
  lastName: string;
  gender?: string;          // 3. Gender
  dateOfBirth?: string;     // 4. Date of birth
  admissionDate?: string;   // 5. Date of admission
  rollNumber?: string;      // 6. Roll no
  aadharNumber?: string;    // 7. Student aadhaar no
  careOfName?: string;      // 8. Care Of Name
  classId?: string;         // 9. Class
  sectionId?: string;       // 10. Section
  fatherName?: string;      // 11. Fathers name
  fatherAadharNo?: string;  // 12. Fathers aadhar no
  motherName?: string;      // 13. Mother name
  motherAadharNo?: string;  // 14. Mother aadhar no
  mobileNo?: string;        // 15. Contact no
  status: string;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
  user?: { email: string };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Detail View State
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ successCount: number; failureCount: number; errors: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete All State
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Enroll Form states (In exact requested order)
  const [admissionNumber, setAdmissionNumber] = useState(''); // 1. SR No
  const [firstName, setFirstName] = useState('');              // 2. Student Name
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');                // 3. Gender
  const [dateOfBirth, setDateOfBirth] = useState('');          // 4. Date of birth
  const [admissionDate, setAdmissionDate] = useState('');      // 5. Date of admission
  const [rollNumber, setRollNumber] = useState('');            // 6. Roll no
  const [aadharNumber, setAadharNumber] = useState('');        // 7. Student aadhaar no
  const [careOfName, setCareOfName] = useState('');            // 8. Care Of Name
  const [classId, setClassId] = useState('');                  // 9. Class
  const [sectionId, setSectionId] = useState('');              // 10. Section
  const [fatherName, setFatherName] = useState('');            // 11. Fathers name
  const [fatherAadharNo, setFatherAadharNo] = useState('');    // 12. Fathers aadhar no
  const [motherName, setMotherName] = useState('');            // 13. Mother name
  const [motherAadharNo, setMotherAadharNo] = useState('');    // 14. Mother aadhar no
  const [mobileNo, setMobileNo] = useState('');                // 15. Contact no
  const [password, setPassword] = useState('StudentPass123!');
  const [email, setEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Form states (In exact requested order)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editAdmissionNumber, setEditAdmissionNumber] = useState(''); // 1. SR No
  const [editFirstName, setEditFirstName] = useState('');              // 2. Student Name
  const [editLastName, setEditLastName] = useState('');
  const [editGender, setEditGender] = useState('Male');                // 3. Gender
  const [editDateOfBirth, setEditDateOfBirth] = useState('');          // 4. Date of birth
  const [editAdmissionDate, setEditAdmissionDate] = useState('');      // 5. Date of admission
  const [editRollNumber, setEditRollNumber] = useState('');            // 6. Roll no
  const [editAadharNumber, setEditAadharNumber] = useState('');        // 7. Student aadhaar no
  const [editCareOfName, setEditCareOfName] = useState('');            // 8. Care Of Name
  const [editClassId, setEditClassId] = useState('');                  // 9. Class
  const [editSectionId, setEditSectionId] = useState('');              // 10. Section
  const [editFatherName, setEditFatherName] = useState('');            // 11. Fathers name
  const [editFatherAadharNo, setEditFatherAadharNo] = useState('');    // 12. Fathers aadhar no
  const [editMotherName, setEditMotherName] = useState('');            // 13. Mother name
  const [editMotherAadharNo, setEditMotherAadharNo] = useState('');    // 14. Mother aadhar no
  const [editMobileNo, setEditMobileNo] = useState('');                // 15. Contact no
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [studentsData, classesData] = await Promise.all([
        apiFetch<Student[]>(`/students?search=${search}&classId=${selectedClass}`),
        apiFetch<ClassItem[]>('/classes'),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedClass]);

  const validateInputs = (aadhar: string, fAadhar: string, mAadhar: string, mob: string): string | null => {
    if (aadhar && !/^\d{12}$/.test(aadhar)) {
      return 'Student Aadhaar number must contain exactly 12 numeric digits (addhar no me 12 numeric digit hi ho)';
    }
    if (fAadhar && !/^\d{12}$/.test(fAadhar)) {
      return "Father's Aadhaar number must contain exactly 12 numeric digits (addhar no me 12 numeric digit hi ho)";
    }
    if (mAadhar && !/^\d{12}$/.test(mAadhar)) {
      return "Mother's Aadhaar number must contain exactly 12 numeric digits (addhar no me 12 numeric digit hi ho)";
    }
    if (mob && !/^\d{10}$/.test(mob)) {
      return 'Contact / Mobile number must contain exactly 10 numeric digits (mob no me 10 numeric digit ho)';
    }
    return null;
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber || !firstName || !lastName || !password) return;

    const valErr = validateInputs(
      aadharNumber.trim(),
      fatherAadharNo.trim(),
      motherAadharNo.trim(),
      mobileNo.trim()
    );
    if (valErr) {
      alert(valErr);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify({
          admissionNumber: admissionNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          dateOfBirth: dateOfBirth || undefined,
          admissionDate: admissionDate || undefined,
          rollNumber: rollNumber.trim() ? rollNumber.trim() : undefined,
          aadharNumber: aadharNumber.trim() ? aadharNumber.trim() : undefined,
          careOfName: careOfName.trim() ? careOfName.trim() : undefined,
          classId: classId || undefined,
          sectionId: sectionId || undefined,
          fatherName: fatherName.trim() ? fatherName.trim() : undefined,
          fatherAadharNo: fatherAadharNo.trim() ? fatherAadharNo.trim() : undefined,
          motherName: motherName.trim() ? motherName.trim() : undefined,
          motherAadharNo: motherAadharNo.trim() ? motherAadharNo.trim() : undefined,
          mobileNo: mobileNo.trim() ? mobileNo.trim() : undefined,
          email: email.trim() ? email.trim() : undefined,
          password,
        }),
      });
      setShowModal(false);
      // Reset form
      setAdmissionNumber('');
      setFirstName('');
      setLastName('');
      setGender('Male');
      setDateOfBirth('');
      setAdmissionDate('');
      setRollNumber('');
      setAadharNumber('');
      setCareOfName('');
      setClassId('');
      setSectionId('');
      setFatherName('');
      setFatherAadharNo('');
      setMotherName('');
      setMotherAadharNo('');
      setMobileNo('');
      setEmail('');
      setPassword('StudentPass123!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditAdmissionNumber(student.admissionNumber || '');
    setEditFirstName(student.firstName || '');
    setEditLastName(student.lastName || '');
    setEditGender(student.gender || 'Male');
    setEditDateOfBirth(student.dateOfBirth ? String(student.dateOfBirth).split('T')[0] : '');
    setEditAdmissionDate(student.admissionDate ? String(student.admissionDate).split('T')[0] : '');
    setEditRollNumber(student.rollNumber || '');
    setEditAadharNumber(student.aadharNumber || '');
    setEditCareOfName(student.careOfName || '');
    setEditClassId(student.classId || (student.class as any)?.id || '');
    setEditSectionId(student.sectionId || (student.section as any)?.id || '');
    setEditFatherName(student.fatherName || '');
    setEditFatherAadharNo(student.fatherAadharNo || '');
    setEditMotherName(student.motherName || '');
    setEditMotherAadharNo(student.motherAadharNo || '');
    setEditMobileNo(student.mobileNo || '');

    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editFirstName || !editLastName || !editAdmissionNumber) return;

    const valErr = validateInputs(
      editAadharNumber.trim(),
      editFatherAadharNo.trim(),
      editMotherAadharNo.trim(),
      editMobileNo.trim()
    );
    if (valErr) {
      alert(valErr);
      return;
    }

    setEditSubmitting(true);
    try {
      await apiFetch(`/students/${editingStudent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          admissionNumber: editAdmissionNumber.trim(),
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          gender: editGender,
          dateOfBirth: editDateOfBirth || undefined,
          admissionDate: editAdmissionDate || undefined,
          rollNumber: editRollNumber.trim() ? editRollNumber.trim() : undefined,
          aadharNumber: editAadharNumber.trim() ? editAadharNumber.trim() : undefined,
          careOfName: editCareOfName.trim() ? editCareOfName.trim() : undefined,
          classId: editClassId || undefined,
          sectionId: editSectionId || undefined,
          fatherName: editFatherName.trim() ? editFatherName.trim() : undefined,
          fatherAadharNo: editFatherAadharNo.trim() ? editFatherAadharNo.trim() : undefined,
          motherName: editMotherName.trim() ? editMotherName.trim() : undefined,
          motherAadharNo: editMotherAadharNo.trim() ? editMotherAadharNo.trim() : undefined,
          mobileNo: editMobileNo.trim() ? editMobileNo.trim() : undefined,
        }),
      });
      setShowEditModal(false);
      setEditingStudent(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update student details');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete student "${student.firstName} ${student.lastName}"? This will also remove their user login account.`)) {
      return;
    }

    try {
      await apiFetch(`/students/${student.id}`, {
        method: 'DELETE',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const handleDeleteAllStudents = async () => {
    setDeletingAll(true);
    try {
      const query = selectedClass ? `?classId=${selectedClass}` : '';
      const res = await apiFetch<{ count: number; message: string }>(`/students/all${query}`, {
        method: 'DELETE',
      });
      alert(res.message || 'All students deleted successfully');
      setShowDeleteAllModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete students');
    } finally {
      setDeletingAll(false);
    }
  };

  // Helper for reliable binary .xlsx file download
  const downloadBinaryExcel = (workbook: XLSX.WorkBook, fileName: string) => {
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Download Sample Excel Template
  const downloadTemplate = () => {
    const templateData = [
      {
        'SR No.': 'ADM-2026-001',
        'First Name': 'Rahul',
        'Last Name': 'Sharma',
        'Gender': 'Male',
        'Date of Birth': '2015-05-15',
        'Date of Admission': '2026-04-01',
        'Roll No': '101',
        'Student Aadhaar No': '123456789012',
        'Care Of Name': 'Rajesh Sharma',
        'Class Name': 'CLASS 1',
        'Section Name': 'A',
        'Father Name': 'Rajesh Sharma',
        'Father Aadhaar No': '987654321012',
        'Mother Name': 'Sunita Sharma',
        'Mother Aadhaar No': '876543210987',
        'Contact No': '9876543210',
      },
      {
        'SR No.': 'ADM-2026-002',
        'First Name': 'Ananya',
        'Last Name': 'Verma',
        'Gender': 'Female',
        'Date of Birth': '2016-08-20',
        'Date of Admission': '2026-04-01',
        'Roll No': '102',
        'Student Aadhaar No': '234567890123',
        'Care Of Name': 'Suresh Verma',
        'Class Name': 'CLASS 2',
        'Section Name': 'B',
        'Father Name': 'Suresh Verma',
        'Father Aadhaar No': '876543210123',
        'Mother Name': 'Priya Verma',
        'Mother Aadhaar No': '765432109876',
        'Contact No': '9123456789',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Students');

    // Auto column widths
    const colWidths = [
      { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
      { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 20 },
      { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
      { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 14 },
    ];
    worksheet['!cols'] = colWidths;

    downloadBinaryExcel(workbook, 'Student_Enrollment_Template.xlsx');
  };

  // Handle Excel/CSV File Upload Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as any[];

        if (rawData.length === 0) {
          alert('Uploaded Excel file contains no data rows.');
          return;
        }

        const mappedRows = rawData.map((row: any, idx: number) => {
          const admNo = String(row['SR No.'] || row['SR No'] || row['Admission No'] || row['admissionNumber'] || `ADM-TEMP-${idx + 1}`).trim();
          const fName = String(row['First Name'] || row['firstName'] || row['Student Name'] || '').trim();
          const lName = String(row['Last Name'] || row['lastName'] || '').trim();
          const gdr = String(row['Gender'] || row['gender'] || 'Male').trim();
          const dob = String(row['Date of Birth'] || row['Date of Birth (YYYY-MM-DD)'] || row['dateOfBirth'] || '').trim();
          const admDate = String(row['Date of Admission'] || row['admissionDate'] || '').trim();
          const roll = String(row['Roll No'] || row['rollNumber'] || '').trim();
          const stAadhaar = String(row['Student Aadhaar No'] || row['Student Aadhaar'] || row['aadharNumber'] || '').replace(/\D/g, '').slice(0, 12);
          const cName = String(row['Care Of Name'] || row['careOfName'] || '').trim();
          const clsName = String(row['Class Name'] || row['Class'] || '').trim();
          const secName = String(row['Section Name'] || row['Section'] || '').trim();
          const ftrName = String(row['Father Name'] || row['fatherName'] || '').trim();
          const ftrAadhaar = String(row['Father Aadhaar No'] || row['fatherAadharNo'] || '').replace(/\D/g, '').slice(0, 12);
          const mtrName = String(row['Mother Name'] || row['motherName'] || '').trim();
          const mtrAadhaar = String(row['Mother Aadhaar No'] || row['motherAadharNo'] || '').replace(/\D/g, '').slice(0, 12);
          const mob = String(row['Contact No'] || row['Mobile No'] || row['mobileNo'] || '').replace(/\D/g, '').slice(0, 10);

          // Find classId & sectionId
          let targetClassId: string | undefined;
          let targetSectionId: string | undefined;

          if (clsName) {
            const foundCls = classes.find((c) => c.name.toLowerCase() === clsName.toLowerCase());
            if (foundCls) {
              targetClassId = foundCls.id;
              if (secName && foundCls.sections) {
                const foundSec = foundCls.sections.find((s) => s.name.toLowerCase() === secName.toLowerCase());
                if (foundSec) targetSectionId = foundSec.id;
              }
            }
          }

          return {
            rowNum: idx + 1,
            admissionNumber: admNo,
            firstName: fName || 'Student',
            lastName: lName || 'Record',
            gender: gdr,
            dateOfBirth: dob || undefined,
            admissionDate: admDate || undefined,
            rollNumber: roll || undefined,
            aadharNumber: stAadhaar || undefined,
            careOfName: cName || undefined,
            classId: targetClassId,
            sectionId: targetSectionId,
            className: clsName,
            sectionName: secName,
            fatherName: ftrName || undefined,
            fatherAadharNo: ftrAadhaar || undefined,
            motherName: mtrName || undefined,
            motherAadharNo: mtrAadhaar || undefined,
            mobileNo: mob || undefined,
          };
        });

        setParsedRows(mappedRows);
        setBulkResult(null);
      } catch (err: any) {
        alert('Failed to parse Excel file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Bulk Import
  const handleConfirmBulkImport = async () => {
    if (parsedRows.length === 0) return;

    setBulkUploading(true);
    try {
      const res = await apiFetch<any>('/students/bulk', {
        method: 'POST',
        body: JSON.stringify(parsedRows),
      });

      setBulkResult(res);
      await loadData();
    } catch (err: any) {
      alert('Bulk upload error: ' + err.message);
    } finally {
      setBulkUploading(false);
    }
  };

  // Export All Students Full Info (Exact 1-15 Entry Order) to Excel
  const exportToExcel = async () => {
    try {
      // Fetch fresh list of all students to ensure complete data
      const allStudentsData = await apiFetch<Student[]>('/students');
      if (!allStudentsData || allStudentsData.length === 0) {
        alert('No student records found to export.');
        return;
      }

      const exportData = allStudentsData.map((s) => ({
        '1. SR No. (Admission No)': s.admissionNumber || '',
        '2. First Name': s.firstName || '',
        '3. Last Name': s.lastName || '',
        '4. Gender': s.gender || '',
        '5. Date of Birth': s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '',
        '6. Date of Admission': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '',
        '7. Roll No': s.rollNumber || '',
        '8. Student Aadhaar No': s.aadharNumber || '',
        '9. Care Of Name': s.careOfName || '',
        '10. Class': s.class?.name || '',
        '11. Section': s.section?.name || '',
        '12. Father Name': s.fatherName || '',
        '13. Father Aadhaar No': s.fatherAadharNo || '',
        '14. Mother Name': s.motherName || '',
        '15. Mother Aadhaar No': s.motherAadharNo || '',
        '16. Contact / Mobile No': s.mobileNo || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All_Students_Full_Info');

      const colWidths = [
        { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
        { wch: 15 }, { wch: 18 }, { wch: 10 }, { wch: 22 },
        { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 },
        { wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 22 },
      ];
      worksheet['!cols'] = colWidths;

      downloadBinaryExcel(workbook, `All_Students_Full_Info_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: any) {
      alert('Failed to export students Excel: ' + err.message);
    }
  };

  // Export Single Student Complete Info to Excel
  const exportSingleStudentToExcel = (s: Student) => {
    const exportData = [{
      'SR No. (Admission No)': s.admissionNumber,
      'First Name': s.firstName,
      'Last Name': s.lastName,
      'Student Full Name': `${s.firstName} ${s.lastName}`,
      'Gender': s.gender || '',
      'Date of Birth': s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '',
      'Date of Admission': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '',
      'Roll No': s.rollNumber || '',
      'Student Aadhaar No': s.aadharNumber || '',
      'Care Of Name': s.careOfName || '',
      'Class': s.class?.name || '',
      'Section': s.section?.name || '',
      'Father Name': s.fatherName || '',
      'Father Aadhaar No': s.fatherAadharNo || '',
      'Mother Name': s.motherName || '',
      'Mother Aadhaar No': s.motherAadharNo || '',
      'Contact / Mobile No': s.mobileNo || '',
      'Account Email': s.user?.email || '',
      'Status': s.status || 'ACTIVE',
    }];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Student_${s.admissionNumber}`);

    const colWidths = [
      { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 22 },
      { wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 10 },
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 18 }, { wch: 25 }, { wch: 10 }
    ];
    worksheet['!cols'] = colWidths;

    downloadBinaryExcel(workbook, `Student_${s.admissionNumber}_Complete_Info.xlsx`);
  };

  // Export Students to PDF
  const exportToPDF = () => {
    if (students.length === 0) {
      alert('No student records to export');
      return;
    }

    const doc = new jsPDF('landscape');

    // Title & Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('School Management System - Students Directory', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Records: ${students.length}`, 14, 25);

    const tableColumn = [
      'SR No.',
      'Student Name',
      'Class (Sec)',
      'DOB',
      'Roll No',
      'Father Name',
      'Mother Name',
      'Contact No',
      'Student Aadhaar',
    ];

    const tableRows = students.map((s) => [
      s.admissionNumber || '',
      `${s.firstName} ${s.lastName}`,
      `${s.class?.name || ''} ${s.section?.name ? `(${s.section.name})` : ''}`.trim(),
      s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : '-',
      s.rollNumber || '-',
      s.fatherName || '-',
      s.motherName || '-',
      s.mobileNo || '-',
      s.aadharNumber || '-',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Students_Directory_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const selectedClassObj = classes.find((c) => c.id === classId);
  const selectedEditClassObj = classes.find((c) => c.id === editClassId);

  return (
    <div className="space-y-6">
      {/* Top Header Card with Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-amber-400" />
            <span>Students Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Summary View with Bulk Excel Import, Template Download & PDF/Excel Export
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Download Sample Excel Template */}
          <button
            onClick={downloadTemplate}
            title="Download Sample Excel Template"
            className="px-3 py-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Excel Template</span>
          </button>

          {/* 2. Bulk Upload Excel */}
          <button
            onClick={() => {
              setParsedRows([]);
              setBulkResult(null);
              setShowBulkModal(true);
            }}
            title="Bulk Enroll Students from Excel"
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload Excel</span>
          </button>

          {/* 3. Export All Students Full Excel */}
          <button
            onClick={exportToExcel}
            title="Download Complete Excel File with All 15 Fields for All Students"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download All Students Full Excel</span>
          </button>

          {/* 4. Export PDF */}
          <button
            onClick={exportToPDF}
            title="Export All Students to PDF"
            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2 border border-rose-500/30 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          {/* 5. Delete All Students Button */}
          <button
            onClick={() => setShowDeleteAllModal(true)}
            title="Delete All Students"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{selectedClass ? 'Delete Class Students' : 'Delete All Students'}</span>
          </button>

          {/* 6. Enroll Student */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500 w-full sm:w-48"
        >
          <option value="">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span>Loading student directory...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">SR No.</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3">Mother Name</th>
                <th className="px-4 py-3 text-center">Edit</th>
                <th className="px-4 py-3 text-center">View All Details</th>
                <th className="px-4 py-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-amber-400">{student.admissionNumber}</td>
                  <td className="px-4 py-3 font-bold text-slate-100">{student.firstName} {student.lastName}</td>
                  <td className="px-4 py-3">{student.class?.name || '-'} {student.section?.name ? `(${student.section.name})` : ''}</td>
                  <td className="px-4 py-3">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{student.fatherName || '-'}</td>
                  <td className="px-4 py-3">{student.motherName || '-'}</td>
                  
                  {/* Dedicated Edit Column */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleOpenEdit(student)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>

                  {/* Dedicated View All Details Column */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setViewingStudent(student)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </td>

                  {/* Dedicated Delete Column */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Upload Excel Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Bulk Upload Students from Excel</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Upload .xlsx or .csv spreadsheet file to enroll multiple students at once</p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-amber-200">
                <span className="font-semibold block mb-0.5">Need the correct Excel layout?</span>
                <span>Download our sample template with standard 15 headers pre-formatted.</span>
              </div>
              <button
                onClick={downloadTemplate}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto hover:bg-amber-400 transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {/* File Input Box */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-900/40">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileSpreadsheet className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">Choose Excel File or Drag & Drop</p>
              <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls and .csv formats</p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select Excel File</span>
              </button>
            </div>

            {/* Parsed Rows Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    Preview Parsed Rows ({parsedRows.length} students found)
                  </span>
                  <span className="text-amber-400 font-mono text-[11px]">Ready for import</span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/60">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">SR No.</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Class</th>
                        <th className="px-3 py-2">Father Name</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Aadhaar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="px-3 py-2 font-mono text-slate-400">{r.rowNum}</td>
                          <td className="px-3 py-2 font-mono text-amber-400 font-semibold">{r.admissionNumber}</td>
                          <td className="px-3 py-2 font-semibold text-slate-100">{r.firstName} {r.lastName}</td>
                          <td className="px-3 py-2">{r.className || '-'} {r.sectionName ? `(${r.sectionName})` : ''}</td>
                          <td className="px-3 py-2">{r.fatherName || '-'}</td>
                          <td className="px-3 py-2 font-mono">{r.mobileNo || '-'}</td>
                          <td className="px-3 py-2 font-mono">{r.aadharNumber || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bulk Upload Result Status */}
            {bulkResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bulk Import Completed: {bulkResult.successCount} Success, {bulkResult.failureCount} Failed</span>
                </div>

                {bulkResult.errors.length > 0 && (
                  <div className="mt-2 text-red-400 space-y-1 max-h-24 overflow-y-auto">
                    {bulkResult.errors.map((err, idx) => (
                      <div key={idx} className="font-mono text-[11px]">
                        Row {err.row} ({err.admissionNumber}): {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Close
              </button>

              <button
                type="button"
                disabled={parsedRows.length === 0 || bulkUploading}
                onClick={handleConfirmBulkImport}
                className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {bulkUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Students` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  <span>Student Full Information</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Complete 15-field profile record</p>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">1. SR No. / Admission No</span>
                <span className="font-mono text-amber-400 font-bold text-sm">{viewingStudent.admissionNumber}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">2. Student Name</span>
                <span className="text-slate-100 font-bold text-sm">{viewingStudent.firstName} {viewingStudent.lastName}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">3. Gender</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.gender || '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">4. Date of Birth</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.dateOfBirth ? new Date(viewingStudent.dateOfBirth).toLocaleDateString() : '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">5. Date of Admission</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.admissionDate ? new Date(viewingStudent.admissionDate).toLocaleDateString() : '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">6. Roll No</span>
                <span className="text-slate-200 font-mono font-semibold">{viewingStudent.rollNumber || '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">7. Student Aadhaar No.</span>
                <span className="text-slate-200 font-mono font-semibold">{viewingStudent.aadharNumber || '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">8. Care Of Name</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.careOfName || '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">9. Class</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.class?.name || '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">10. Section</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.section?.name || '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">11. Father's Name</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.fatherName || '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">12. Father Aadhaar No.</span>
                <span className="text-slate-200 font-mono font-semibold">{viewingStudent.fatherAadharNo || '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">13. Mother's Name</span>
                <span className="text-slate-200 font-semibold">{viewingStudent.motherName || '-'}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block font-medium mb-1">14. Mother Aadhaar No.</span>
                <span className="text-slate-200 font-mono font-semibold">{viewingStudent.motherAadharNo || '-'}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block font-medium mb-1">15. Contact / Mobile No.</span>
                <span className="text-slate-200 font-mono font-semibold">{viewingStudent.mobileNo || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleDeleteStudent(viewingStudent)}
                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => exportSingleStudentToExcel(viewingStudent)}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 border border-emerald-500/30 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Student Excel</span>
                </button>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    handleOpenEdit(st);
                  }}
                  className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Student Modal (Exact Serial Order) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-100">Enroll New Student</h2>

            <form onSubmit={handleEnroll} className="space-y-4">
              {/* 1. SR No & 2. Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">1. SR No. (Admission No)</label>
                  <input
                    type="text"
                    placeholder="ADM-2026-001"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">2. First Name</label>
                  <input
                    type="text"
                    placeholder="Alice"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* 3. Gender, 4. Date of Birth, 5. Date of Admission */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">3. Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">4. Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">5. Date of Admission</label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 6. Roll No, 7. Student Aadhaar No, 8. Care Of Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">6. Roll No.</label>
                  <input
                    type="text"
                    placeholder="101"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">7. Student Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">8. Care Of Name</label>
                  <input
                    type="text"
                    placeholder="Guardian / Care Of Name"
                    value={careOfName}
                    onChange={(e) => setCareOfName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 9. Class & 10. Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">9. Class</label>
                  <select
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      setSectionId('');
                    }}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">10. Section</label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Section</option>
                    {selectedClassObj?.sections?.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 11. Father Name, 12. Father Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">11. Father's Name</label>
                  <input
                    type="text"
                    placeholder="Father Full Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">12. Father Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={fatherAadharNo}
                    onChange={(e) => setFatherAadharNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 13. Mother Name, 14. Mother Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">13. Mother's Name</label>
                  <input
                    type="text"
                    placeholder="Mother Full Name"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">14. Mother Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={motherAadharNo}
                    onChange={(e) => setMotherAadharNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 15. Contact No */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">15. Contact No. / Mobile No. (10 digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal (Exact Serial Order) */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-100">Edit Student Record</h2>
              <span className="text-xs text-amber-400 font-mono font-semibold">{editingStudent.admissionNumber}</span>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              {/* 1. SR No & 2. Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">1. SR No. (Admission No)</label>
                  <input
                    type="text"
                    value={editAdmissionNumber}
                    onChange={(e) => setEditAdmissionNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">2. First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* 3. Gender, 4. Date of Birth, 5. Date of Admission */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">3. Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">4. Date of Birth</label>
                  <input
                    type="date"
                    value={editDateOfBirth}
                    onChange={(e) => setEditDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">5. Date of Admission</label>
                  <input
                    type="date"
                    value={editAdmissionDate}
                    onChange={(e) => setEditAdmissionDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 6. Roll No, 7. Student Aadhaar No, 8. Care Of Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">6. Roll No.</label>
                  <input
                    type="text"
                    value={editRollNumber}
                    onChange={(e) => setEditRollNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">7. Student Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editAadharNumber}
                    onChange={(e) => setEditAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">8. Care Of Name</label>
                  <input
                    type="text"
                    value={editCareOfName}
                    onChange={(e) => setEditCareOfName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 9. Class & 10. Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">9. Class</label>
                  <select
                    value={editClassId}
                    onChange={(e) => {
                      setEditClassId(e.target.value);
                      setEditSectionId('');
                    }}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">10. Section</label>
                  <select
                    value={editSectionId}
                    onChange={(e) => setEditSectionId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select Section</option>
                    {selectedEditClassObj?.sections?.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 11. Father Name, 12. Father Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">11. Father's Name</label>
                  <input
                    type="text"
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">12. Father Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editFatherAadharNo}
                    onChange={(e) => setEditFatherAadharNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 13. Mother Name, 14. Mother Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">13. Mother's Name</label>
                  <input
                    type="text"
                    value={editMotherName}
                    onChange={(e) => setEditMotherName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">14. Mother Aadhaar No. (12 digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={editMotherAadharNo}
                    onChange={(e) => setEditMotherAadharNo(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* 15. Contact No */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">15. Contact No. / Mobile No. (10 digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={editMobileNo}
                  onChange={(e) => setEditMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 gradient-button text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                >
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete All Modal Confirmation */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-rose-500/30 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Delete All Students</h3>
                <p className="text-xs text-rose-400 font-medium">Warning: Irreversible Action</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                {selectedClass ? (
                  <>You are about to delete <strong>ALL students in {classes.find((c) => c.id === selectedClass)?.name || 'the selected class'}</strong> ({students.length} students currently shown).</>
                ) : (
                  <>You are about to delete <strong>ALL students in the entire school</strong> ({students.length} total students).</>
                )}
              </p>
              <p className="text-rose-400">
                This will permanently delete student profiles, student user login accounts, academic records, and attendance data.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllStudents}
                disabled={deletingAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {deletingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete All Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
