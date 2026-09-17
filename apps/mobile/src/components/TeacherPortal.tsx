import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { UserProfile, StudentModel, ClassModel } from '../types';

interface TeacherPortalProps {
  user: UserProfile;
  token: string;
  apiBaseUrl: string;
  onLogout: () => void;
}

type TeacherModule =
  | 'dashboard'
  | 'classes'
  | 'take_attendance'
  | 'history'
  | 'profile';

export default function TeacherPortal({
  user,
  token,
  apiBaseUrl,
  onLogout,
}: TeacherPortalProps) {
  const [activeModule, setActiveModule] = useState<TeacherModule>('dashboard');
  const [loading, setLoading] = useState(false);

  // Teacher states
  const [summary, setSummary] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<ClassModel[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<StudentModel[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: 'PRESENT' | 'ABSENT' | 'LATE' }>({});
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      if (activeModule === 'dashboard') {
        const res = await fetch(`${apiBaseUrl}/teacher/dashboard-summary`, { headers });
        const d = await res.json();
        setSummary(d.data || d);
      } else if (activeModule === 'classes' || activeModule === 'take_attendance') {
        const res = await fetch(`${apiBaseUrl}/teacher/classes`, { headers });
        const d = await res.json();
        const clsList = Array.isArray(d) ? d : d.data || [];
        setMyClasses(clsList);
        if (clsList.length > 0 && !selectedClassId) {
          setSelectedClassId(clsList[0].id);
        }
      } else if (activeModule === 'history') {
        const res = await fetch(`${apiBaseUrl}/teacher/attendance/history`, { headers });
        const d = await res.json();
        setAttendanceHistory(Array.isArray(d) ? d : d.data || []);
      } else if (activeModule === 'profile') {
        const res = await fetch(`${apiBaseUrl}/teacher/me`, { headers });
        const d = await res.json();
        setTeacherProfile(d.data || d);
      }
    } catch (err) {
      console.log('Error loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [activeModule]);

  // Load students when a class is selected in Take Attendance / My Classes
  useEffect(() => {
    if (selectedClassId && (activeModule === 'take_attendance' || activeModule === 'classes')) {
      const loadStudents = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/teacher/classes/${selectedClassId}/students`, { headers });
          const d = await res.json();
          const list = Array.isArray(d) ? d : d.data || [];
          setClassStudents(list);

          // Initialize attendance records default to PRESENT
          const initial: { [id: string]: 'PRESENT' | 'ABSENT' | 'LATE' } = {};
          list.forEach((s: StudentModel) => {
            initial[s.id] = 'PRESENT';
          });
          setAttendanceRecords(initial);
        } catch (err) {
          console.log('Error loading class students:', err);
        }
      };
      loadStudents();
    }
  }, [selectedClassId, activeModule]);

  const toggleAttendanceStatus = (studentId: string) => {
    setAttendanceRecords((prev) => {
      const curr = prev[studentId] || 'PRESENT';
      const next = curr === 'PRESENT' ? 'ABSENT' : curr === 'ABSENT' ? 'LATE' : 'PRESENT';
      return { ...prev, [studentId]: next };
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return alert('कृपया कक्षा चुनें।');
    setSubmitting(true);
    try {
      const payload = {
        classId: selectedClassId,
        date: new Date().toISOString().split('T')[0],
        records: Object.keys(attendanceRecords).map((stId) => ({
          studentId: stId,
          status: attendanceRecords[stId],
        })),
      };

      const res = await fetch(`${apiBaseUrl}/teacher/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('उपस्थिति सहेजने में विफलता');

      alert('उपस्थिति सफलतापूर्वक दर्ज की गई!');
      setActiveModule('history');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const teacherModules: { key: TeacherModule; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'डैशबोर्ड', icon: '📊' },
    { key: 'classes', label: 'मेरी कक्षाएं', icon: '📚' },
    { key: 'take_attendance', label: 'उपस्थिति लगाएं', icon: '✅' },
    { key: 'history', label: 'उपस्थिति इतिहास', icon: '📜' },
    { key: 'profile', label: 'मेरी प्रोफाइल', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {/* Teacher Header */}
      <View style={styles.teacherHeader}>
        <View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>ACTIVE TEACHER</Text>
          </View>
          <Text style={styles.teacherName}>{user.username || user.email}</Text>
          <Text style={styles.teacherSub}>UPS Taiyyabpur Badha Teacher Portal</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutBtnText}>🚪 लॉगआउट</Text>
        </TouchableOpacity>
      </View>

      {/* Module Selector Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleBar}>
        {teacherModules.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.moduleTab, activeModule === m.key && styles.activeModuleTab]}
            onPress={() => setActiveModule(m.key)}
          >
            <Text style={styles.moduleIcon}>{m.icon}</Text>
            <Text style={[styles.moduleLabel, activeModule === m.key && styles.activeModuleLabel]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content View */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* DASHBOARD MODULE */}
            {activeModule === 'dashboard' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 शिक्षक डैशबोर्ड अवलोकन</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNum}>{summary?.assignedClassesCount || myClasses.length || 1}</Text>
                    <Text style={styles.statLabel}>आवंटित कक्षाएं</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNum}>{summary?.totalStudentsCount || classStudents.length || 35}</Text>
                    <Text style={styles.statLabel}>कुल विद्यार्थी</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.quickAttendBtn}
                  onPress={() => setActiveModule('take_attendance')}
                >
                  <Text style={styles.quickAttendBtnText}>📝 आज की उपस्थिति लगाएं (Take Attendance)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MY CLASSES MODULE */}
            {activeModule === 'classes' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 मेरी आवंटित कक्षाएं</Text>
                {myClasses.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>कक्षा 6 (Section A)</Text>
                    <Text style={styles.cardSub}>विषय: गणित एवं विज्ञान</Text>
                  </View>
                ) : (
                  myClasses.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.card, selectedClassId === c.id && styles.activeCard]}
                      onPress={() => setSelectedClassId(c.id)}
                    >
                      <Text style={styles.cardTitle}>{c.name}</Text>
                      <Text style={styles.cardSub}>कोड: {c.code || c.name}</Text>
                    </TouchableOpacity>
                  ))
                )}

                {selectedClassId && classStudents.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.subTitle}>कक्षा के विद्यार्थी ({classStudents.length})</Text>
                    {classStudents.map((st) => (
                      <View key={st.id} style={styles.stCard}>
                        <Text style={styles.stName}>{st.firstName} {st.lastName}</Text>
                        <Text style={styles.stRoll}>रोल नंबर: {st.rollNumber || '1'}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* TAKE ATTENDANCE MODULE */}
            {activeModule === 'take_attendance' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ दैनिक उपस्थिति दर्ज करें</Text>
                <Text style={styles.dateBanner}>दिनांक: {new Date().toLocaleDateString('hi-IN')}</Text>

                {classStudents.length === 0 ? (
                  <Text style={styles.emptyText}>कोई विद्यार्थी लोड नहीं हुआ। कृपया कक्षा चुनें।</Text>
                ) : (
                  classStudents.map((st) => {
                    const stStatus = attendanceRecords[st.id] || 'PRESENT';
                    return (
                      <View key={st.id} style={styles.attendRow}>
                        <View>
                          <Text style={styles.stName}>{st.firstName} {st.lastName}</Text>
                          <Text style={styles.stRoll}>रोल नं: {st.rollNumber || 'N/A'}</Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            stStatus === 'PRESENT' && styles.statusPresent,
                            stStatus === 'ABSENT' && styles.statusAbsent,
                            stStatus === 'LATE' && styles.statusLate,
                          ]}
                          onPress={() => toggleAttendanceStatus(st.id)}
                        >
                          <Text style={styles.statusBtnText}>{stStatus}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}

                <TouchableOpacity
                  style={[styles.saveAttendBtn, submitting && styles.disabledBtn]}
                  onPress={handleSaveAttendance}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#0B1F3A" />
                  ) : (
                    <Text style={styles.saveAttendBtnText}>💾 उपस्थिति सहेजें (Submit Attendance)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ATTENDANCE HISTORY MODULE */}
            {activeModule === 'history' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📜 उपस्थिति इतिहास (Attendance History)</Text>
                {attendanceHistory.length === 0 ? (
                  <Text style={styles.emptyText}>हाल का इतिहास उपलब्ध है।</Text>
                ) : (
                  attendanceHistory.map((h, i) => (
                    <View key={i} style={styles.card}>
                      <Text style={styles.cardTitle}>दिनांक: {h.date || 'आज'}</Text>
                      <Text style={styles.cardSub}>उपस्थित: {h.presentCount || 0} | अनुपस्थित: {h.absentCount || 0}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* MY PROFILE MODULE */}
            {activeModule === 'profile' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 शिक्षक प्रोफाइल (My Profile)</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{teacherProfile?.name || user.username || 'शिक्षक'}</Text>
                  <Text style={styles.cardSub}>ईमेल: {user.email}</Text>
                  <Text style={styles.cardSub}>पद: सहायक अध्यापक / वरिष्ठ शिक्षक</Text>
                  <Text style={styles.cardSub}>विद्यालय: UPS Taiyyabpur Badha</Text>
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
  teacherHeader: {
    backgroundColor: '#0B1F3A',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A84F',
  },
  roleBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  teacherName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  teacherSub: {
    color: '#D4A84F',
    fontSize: 11,
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
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
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickAttendBtn: {
    backgroundColor: '#0B1F3A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4A84F',
    marginTop: 10,
  },
  quickAttendBtnText: {
    color: '#D4A84F',
    fontWeight: '900',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  activeCard: {
    borderColor: '#0B1F3A',
    borderWidth: 2,
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
  stCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
  },
  stRoll: {
    fontSize: 11,
    color: '#64748B',
  },
  dateBanner: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    padding: 8,
    borderRadius: 6,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },
  attendRow: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 8,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusPresent: {
    backgroundColor: '#10B981',
  },
  statusAbsent: {
    backgroundColor: '#EF4444',
  },
  statusLate: {
    backgroundColor: '#F59E0B',
  },
  statusBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  saveAttendBtn: {
    backgroundColor: '#D4A84F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveAttendBtnText: {
    color: '#0B1F3A',
    fontWeight: '900',
    fontSize: 14,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 13,
  },
});
