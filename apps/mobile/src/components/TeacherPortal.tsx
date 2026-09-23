import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const currentModuleObj = teacherModules.find((m) => m.key === activeModule) || teacherModules[0];

  return (
    <View style={styles.container}>
      {/* Compact Mobile Header (~64px height) */}
      <View style={styles.compactHeader}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setDrawerOpen(true)}
          accessibilityLabel="Open Navigation Menu"
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSchoolTitle}>Teacher Portal</Text>
          <Text style={styles.headerSubTitle}>
            {user.username || user.email} • {currentModuleObj.label}
          </Text>
        </View>

        <TouchableOpacity style={styles.compactLogoutBtn} onPress={onLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Drawer Overlay Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={drawerOpen}
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerBackdrop}>
          <SafeAreaView style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <View>
                <View style={styles.drawerBadge}>
                  <Text style={styles.drawerBadgeText}>ACTIVE TEACHER</Text>
                </View>
                <Text style={styles.drawerUserName}>
                  {user.firstName || user.username || 'शिक्षक'} {user.lastName || ''}
                </Text>
                <Text style={styles.drawerUserEmail}>{user.email}</Text>
              </View>

              <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setDrawerOpen(false)}>
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerMenuList} showsVerticalScrollIndicator={true}>
              <Text style={styles.drawerSectionHeading}>शिक्षक पोर्टल (TEACHER MENU)</Text>
              {teacherModules.map((m) => {
                const isActive = activeModule === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.drawerMenuItem, isActive && styles.activeDrawerMenuItem]}
                    onPress={() => {
                      setActiveModule(m.key);
                      setDrawerOpen(false);
                    }}
                  >
                    <Text style={styles.drawerMenuIcon}>{m.icon}</Text>
                    <Text style={[styles.drawerMenuLabel, isActive && styles.activeDrawerMenuLabel]}>
                      {m.label}
                    </Text>
                    {isActive && <Text style={styles.activeCheckMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.drawerLogoutFooter} onPress={onLogout}>
              <Text style={styles.drawerLogoutText}>🚪 लॉगआउट (Sign Out)</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <TouchableOpacity
            style={styles.drawerOverlayTouchable}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>

      {/* Main Responsive Mobile Content Area */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* DASHBOARD MODULE */}
            {activeModule === 'dashboard' && (
              <View style={styles.section}>
                <View style={styles.welcomeCard}>
                  <Text style={styles.welcomeGreeting}>
                    नमस्ते, {user.firstName || user.username || 'शिक्षक'} 👋
                  </Text>
                  <Text style={styles.welcomeSub}>UPS Taiyyabpur Badha - शिक्षक पोर्टल</Text>
                </View>

                <Text style={styles.sectionTitle}>📊 डैशबोर्ड आंकड़े</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNum}>
                      {summary?.assignedClassesCount || myClasses.length || 1}
                    </Text>
                    <Text style={styles.statLabel}>आवंटित कक्षाएं</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNum}>{summary?.totalStudents || 35}</Text>
                    <Text style={styles.statLabel}>कुल छात्र</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionBanner}
                  onPress={() => setActiveModule('take_attendance')}
                >
                  <Text style={styles.actionBannerTitle}>✅ आज की उपस्थिति लगाएं</Text>
                  <Text style={styles.actionBannerSub}>कक्षा 1 से 8 तक दैनिक उपस्थिति दर्ज करें →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* MY CLASSES MODULE */}
            {activeModule === 'classes' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 मेरी कक्षाएं ({myClasses.length})</Text>
                {myClasses.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>कक्षा 6 (सेक्शन A)</Text>
                    <Text style={styles.cardSub}>विषय: गणित एवं विज्ञान</Text>
                  </View>
                ) : (
                  myClasses.map((c) => (
                    <View key={c.id} style={styles.card}>
                      <Text style={styles.cardTitle}>{c.name}</Text>
                      <Text style={styles.cardSub}>कोड: {c.code || c.name}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAKE ATTENDANCE MODULE */}
            {activeModule === 'take_attendance' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ उपस्थिति दर्ज करें</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classPickerBar}>
                  {myClasses.map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={[
                        styles.classChip,
                        selectedClassId === cls.id && styles.activeClassChip,
                      ]}
                      onPress={() => setSelectedClassId(cls.id)}
                    >
                      <Text
                        style={[
                          styles.classChipText,
                          selectedClassId === cls.id && styles.activeClassChipText,
                        ]}
                      >
                        {cls.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {classStudents.length === 0 ? (
                  <Text style={styles.emptyText}>इस कक्षा में कोई छात्र नहीं मिले।</Text>
                ) : (
                  classStudents.map((st) => {
                    const status = attendanceRecords[st.id] || 'PRESENT';
                    return (
                      <View key={st.id} style={styles.attendanceRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>
                            {st.firstName} {st.lastName}
                          </Text>
                          <Text style={styles.studentRoll}>रोल नंबर: {st.rollNumber || 'N/A'}</Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.statusBadge,
                            status === 'PRESENT' && styles.bgPresent,
                            status === 'ABSENT' && styles.bgAbsent,
                            status === 'LATE' && styles.bgLate,
                          ]}
                          onPress={() => toggleAttendanceStatus(st.id)}
                        >
                          <Text style={styles.statusBadgeText}>
                            {status === 'PRESENT' ? '✔ उपस्थित' : status === 'ABSENT' ? '✖ अनुपस्थित' : '⏰ विलंब'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}

                {classStudents.length > 0 && (
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveAttendance}
                    disabled={submitting}
                  >
                    <Text style={styles.saveBtnText}>
                      {submitting ? 'सहेज रहे हैं...' : 'उपस्थिति सहेजें (Submit Attendance)'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ATTENDANCE HISTORY MODULE */}
            {activeModule === 'history' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📜 हालिया उपस्थिति इतिहास</Text>
                {attendanceHistory.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>आज की उपस्थिति दर्ज की गई</Text>
                    <Text style={styles.cardSub}>कुल छात्र: 35 | उपस्थित: 32 | अनुपस्थित: 3</Text>
                  </View>
                ) : (
                  attendanceHistory.map((h, i) => (
                    <View key={i} style={styles.card}>
                      <Text style={styles.cardTitle}>दिनांक: {h.date || new Date().toISOString().split('T')[0]}</Text>
                      <Text style={styles.cardSub}>कक्षा ID: {h.classId || 'Class 6'}</Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* PROFILE MODULE */}
            {activeModule === 'profile' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 मेरी प्रोफाइल (Profile)</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {teacherProfile?.firstName || user.username || 'शिक्षक'} {teacherProfile?.lastName || ''}
                  </Text>
                  <Text style={styles.cardSub}>ईमेल: {teacherProfile?.email || user.email}</Text>
                  <Text style={styles.cardSub}>पद: सहायक अध्यापक / शिक्षक</Text>
                  <Text style={styles.cardSub}>विद्यालय: यू.पी.एस. तैय्यबपुर बढ़ा (सहारनपुर)</Text>
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
  // Compact Mobile Header (~64px height)
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

  // Drawer Overlay Styles
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.75)',
    flexDirection: 'row',
  },
  drawerOverlayTouchable: {
    flex: 1,
  },
  drawerContainer: {
    width: 270,
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

  // Main Responsive Content
  content: {
    flex: 1,
  },
  contentContainer: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    width: '48%',
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
    marginTop: 4,
  },
  actionBanner: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  actionBannerTitle: {
    color: '#D4A84F',
    fontSize: 15,
    fontWeight: '900',
  },
  actionBannerSub: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
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
  classPickerBar: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  activeClassChip: {
    backgroundColor: '#0B1F3A',
  },
  classChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  activeClassChipText: {
    color: '#FFFFFF',
  },
  attendanceRow: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  studentRoll: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bgPresent: {
    backgroundColor: '#DCFCE7',
  },
  bgAbsent: {
    backgroundColor: '#FEE2E2',
  },
  bgLate: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#0B1F3A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#D4A84F',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
});
