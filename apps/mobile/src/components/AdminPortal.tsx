import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
  TimetableModel,
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

  // Data states
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [teachers, setTeachers] = useState<TeacherModel[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearModel[]>([]);
  const [notices, setNotices] = useState<NoticeModel[]>([]);
  const [holidays, setHolidays] = useState<HolidayModel[]>([]);
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoiceModel[]>([]);
  const [timetables, setTimetables] = useState<TimetableModel[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal / Creation States
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRoll, setFRoll] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fCategory, setFCategory] = useState('ACADEMIC');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data depending on active module
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
        const res = await fetch(`${apiBaseUrl}/students`, { headers });
        const d = await res.json();
        setStudents(Array.isArray(d) ? d : d.data || []);
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
        const res = await fetch(`${apiBaseUrl}/exams`, { headers });
        const d = await res.json();
        setExams(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'fees') {
        const res = await fetch(`${apiBaseUrl}/fees/invoices`, { headers });
        const d = await res.json();
        setFeeInvoices(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'timetables') {
        const res = await fetch(`${apiBaseUrl}/timetables`, { headers });
        const d = await res.json();
        setTimetables(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'school') {
        const res = await fetch(`${apiBaseUrl}/school`, { headers });
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

  // Form Submission Handlers
  const handleAddStudent = async () => {
    if (!fName || !lName) return alert('प्रथम व अंतिम नाम आवश्यक हैं।');
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: fName, lastName: lName, rollNumber: fRoll }),
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
    { key: 'overview', label: 'ओवरव्यू', icon: '📊' },
    { key: 'students', label: 'विद्यार्थी', icon: '🎓' },
    { key: 'teachers', label: 'शिक्षक', icon: '👨‍🏫' },
    { key: 'classes', label: 'कक्षाएं', icon: '📚' },
    { key: 'academics', label: 'सत्र (Academic)', icon: '📅' },
    { key: 'attendance', label: 'उपस्थिति', icon: '✅' },
    { key: 'exams', label: 'परीक्षाएं', icon: '🏆' },
    { key: 'fees', label: 'शुल्क (Fees)', icon: '💳' },
    { key: 'timetables', label: 'समय-सारणी', icon: '⏰' },
    { key: 'notices', label: 'नोटिस बोर्ड', icon: '📢' },
    { key: 'holidays', label: 'अवकाश सूची', icon: '🌴' },
    { key: 'school', label: 'स्कूल प्रोफाइल', icon: '🏫' },
  ];

  return (
    <View style={styles.container}>
      {/* Admin Top Header Card */}
      <View style={styles.adminHeader}>
        <View>
          <View style={styles.adminRoleBadge}>
            <Text style={styles.adminRoleText}>SCHOOL ADMIN</Text>
          </View>
          <Text style={styles.adminName}>{user.firstName || 'प्रशासक'} {user.lastName || 'एडमिन'}</Text>
          <Text style={styles.adminEmail}>{user.email}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>🚪 लॉगआउट</Text>
        </TouchableOpacity>
      </View>

      {/* Module Selector Scroll Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleBar}>
        {modulesList.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.moduleTab, activeModule === m.key && styles.activeModuleTab]}
            onPress={() => {
              setActiveModule(m.key);
              setShowForm(false);
            }}
          >
            <Text style={styles.moduleIcon}>{m.icon}</Text>
            <Text style={[styles.moduleLabel, activeModule === m.key && styles.activeModuleLabel]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content View */}
      <ScrollView style={styles.mainContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* OVERVIEW MODULE */}
            {activeModule === 'overview' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 एडमिन डैशबोर्ड अवलोकन</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{students.length}</Text>
                    <Text style={styles.statTitle}>कुल विद्यार्थी</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{teachers.length}</Text>
                    <Text style={styles.statTitle}>कुल शिक्षक</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{classes.length}</Text>
                    <Text style={styles.statTitle}>कक्षाएं</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{notices.length}</Text>
                    <Text style={styles.statTitle}>नोटिस</Text>
                  </View>
                </View>

                <Text style={styles.subHeader}>📢 हालिया नोटिस</Text>
                {notices.slice(0, 3).map((n) => (
                  <View key={n.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{n.title}</Text>
                    <Text style={styles.cardDesc}>{n.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* STUDENTS MODULE */}
            {activeModule === 'students' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>🎓 विद्यार्थी प्रबंधन ({students.length})</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtnText}>{showForm ? '✖ बंद करें' : '➕ नया छात्र'}</Text>
                  </TouchableOpacity>
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

                {students.map((st) => (
                  <View key={st.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{st.firstName} {st.lastName}</Text>
                    <Text style={styles.cardSub}>रोल नंबर: {st.rollNumber || 'N/A'} | कक्षा: {st.class?.name || 'Class 1'}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* TEACHERS MODULE */}
            {activeModule === 'teachers' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>👨‍🏫 शिक्षक प्रबंधन ({teachers.length})</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtnText}>{showForm ? '✖ बंद करें' : '➕ नया शिक्षक'}</Text>
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
                    <Text style={styles.cardSub}>ईमेल: {tc.email} | फोन: {tc.phone || '9058347719'}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* CLASSES MODULE */}
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

            {/* NOTICES MODULE */}
            {activeModule === 'notices' && (
              <View style={styles.section}>
                <View style={styles.sectionTop}>
                  <Text style={styles.sectionTitle}>📢 नोटिस बोर्ड ({notices.length})</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtnText}>{showForm ? '✖ बंद करें' : '➕ नया नोटिस'}</Text>
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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

            {/* HOLIDAYS MODULE */}
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

            {/* ACADEMICS / EXAMS / FEES / TIMETABLES / SCHOOL PROFILE */}
            {activeModule === 'academics' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 शैक्षणिक सत्र (Academic Years)</Text>
                {academicYears.length === 0 ? <Text style={styles.empty}>सत्र 2026-2027 (सक्रिय)</Text> : academicYears.map(a => (
                  <View key={a.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{a.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'exams' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 परीक्षा एवं परिणाम प्रबंधन</Text>
                {exams.length === 0 ? <Text style={styles.empty}>वार्षिक परीक्षा समय सारणी 2026</Text> : exams.map(e => (
                  <View key={e.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{e.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeModule === 'fees' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 शुल्क एवं चालान (Fees & Billing)</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>सरकारी प्राथमिक एवं उच्च प्राथमिक विद्यालय (निःशुल्क शिक्षा योजना)</Text>
                </View>
              </View>
            )}

            {activeModule === 'timetables' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏰ विद्यालय समय सारणी (Timetables)</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>कक्षा 1 से 8 दैनिक पठन-पाठन समय सारणी</Text>
                </View>
              </View>
            )}

            {activeModule === 'school' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏫 विद्यालय विवरण (School Profile)</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>UPS Taiyyabpur Badha</Text>
                  <Text style={styles.cardSub}>UDISE Code: 09011101603</Text>
                  <Text style={styles.cardSub}>ग्राम: तैय्यबपुर बढ़ा, नागल, सहारनपुर (उ.प्र.)</Text>
                  <Text style={styles.cardSub}>फोन: 9058347719 | प्रधानाध्यापक: संजय कुमार</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  adminHeader: {
    backgroundColor: '#0B1F3A',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A84F',
  },
  adminRoleBadge: {
    backgroundColor: '#D4A84F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminRoleText: {
    color: '#0B1F3A',
    fontWeight: '900',
    fontSize: 10,
  },
  adminName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  adminEmail: {
    color: '#94A3B8',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  moduleBar: {
    backgroundColor: '#0B1F3A',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  moduleTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
  },
  activeModuleTab: {
    backgroundColor: '#D4A84F',
  },
  moduleIcon: {
    fontSize: 14,
  },
  moduleLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activeModuleLabel: {
    color: '#0B1F3A',
    fontWeight: '900',
  },
  mainContent: {
    flex: 1,
    padding: 16,
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
    marginTop: 8,
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
    gap: 10,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNum: {
    fontSize: 22,
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
  empty: {
    color: '#64748B',
    fontSize: 13,
  },
});
