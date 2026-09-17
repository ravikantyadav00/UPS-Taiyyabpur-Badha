import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { UserProfile, NoticeModel, HolidayModel } from './src/types';
import AdminPortal from './src/components/AdminPortal';
import TeacherPortal from './src/components/TeacherPortal';

const API_BASE_URL = 'http://localhost:3001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'notices' | 'holidays' | 'portal'>('home');
  const [notices, setNotices] = useState<NoticeModel[]>([]);
  const [holidays, setHolidays] = useState<HolidayModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mobile Auth State (Separate from Web, using backend API)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('admin@school.com');
  const [password, setPassword] = useState('AdminSecret123!');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchCommonBackendData = async () => {
    setLoading(true);
    try {
      // Fetch dynamic public notices from common NestJS backend API
      const nRes = await fetch(`${API_BASE_URL}/public/notices`);
      const nData = await nRes.json();
      const noticeList = Array.isArray(nData) ? nData : nData.data || [];
      setNotices(noticeList);

      // Fetch dynamic public holidays from common NestJS backend API
      const hRes = await fetch(`${API_BASE_URL}/public/holidays`);
      const hData = await hRes.json();
      const holidayList = Array.isArray(hData) ? hData : hData.data || [];
      setHolidays(holidayList);
    } catch (err) {
      console.log('Error fetching backend data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommonBackendData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommonBackendData();
  };

  // Handle In-App Mobile Authentication
  const handleLogin = async () => {
    if (!identifier || !password) {
      setAuthError('ईमेल/यूजरनेम और पासवर्ड दोनों आवश्यक हैं।');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'लॉगिन असफल रहा। कृपया साख (credentials) जांचें।');
      }

      const payload = resData.data || resData;
      setToken(payload.accessToken);
      setUser(payload.user);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || 'लॉगिन में त्रुटि हुई।');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  // Render Role-based Authenticated Dashboard
  if (user && token) {
    if (user.role === 'TEACHER') {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <TeacherPortal
            user={user}
            token={token}
            apiBaseUrl={API_BASE_URL}
            onLogout={handleLogout}
          />
        </SafeAreaView>
      );
    }

    // Default to ADMIN portal for Admin / Staff roles
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <AdminPortal
          user={user}
          token={token}
          apiBaseUrl={API_BASE_URL}
          onLogout={handleLogout}
          refreshPublicData={fetchCommonBackendData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Official School App Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.goldBadge}>
            <Text style={styles.goldBadgeText}>GOVT. BASIC SCHOOL</Text>
          </View>
          <Text style={styles.udiseText}>UDISE: 09011101603</Text>
        </View>

        <Text style={styles.schoolTitle}>यू.पी.एस. तैय्यबपुर बढ़ा</Text>
        <Text style={styles.schoolSubTitle}>UPS Taiyyabpur Badha, Nagal, Saharanpur</Text>
        <Text style={styles.tagline}>प्राथमिक एवं उच्च प्राथमिक विद्यालय (कक्षा 1 से 8)</Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.activeTabButton]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>🏠 होम</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notices' && styles.activeTabButton]}
          onPress={() => setActiveTab('notices')}
        >
          <Text style={[styles.tabText, activeTab === 'notices' && styles.activeTabText]}>
            📢 नोटिस ({notices.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'holidays' && styles.activeTabButton]}
          onPress={() => setActiveTab('holidays')}
        >
          <Text style={[styles.tabText, activeTab === 'holidays' && styles.activeTabText]}>
            🌴 अवकाश ({holidays.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'portal' && styles.activeTabButton]}
          onPress={() => setActiveTab('portal')}
        >
          <Text style={[styles.tabText, activeTab === 'portal' && styles.activeTabText]}>
            🔐 लॉगिन
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D4A84F']} />}
      >
        {activeTab === 'home' && (
          <View style={styles.tabContent}>
            {/* Live Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>350+</Text>
                <Text style={styles.statLabel}>विद्यार्थी (Students)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>शिक्षक (Teachers)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>1–8</Text>
                <Text style={styles.statLabel}>कक्षाएं (Classes)</Text>
              </View>
            </View>

            {/* School Facilities */}
            <Text style={styles.sectionHeader}>🏫 विद्यालय सुविधाएं</Text>
            <View style={styles.facilityCard}>
              <Text style={styles.facilityTitle}>💻 कंप्यूटर लैब व स्मार्ट क्लास</Text>
              <Text style={styles.facilityDesc}>डिजिटल शिक्षा और व्यावहारिक कंप्यूटर ज्ञान के लिए आधुनिक लैब।</Text>
            </View>
            <View style={styles.facilityCard}>
              <Text style={styles.facilityTitle}>📚 पुस्तकालय (Library)</Text>
              <Text style={styles.facilityDesc}>विद्यार्थियों के ज्ञानवर्धन हेतु ज्ञानवर्धक पुस्तकों का संग्रह।</Text>
            </View>
            <View style={styles.facilityCard}>
              <Text style={styles.facilityTitle}>⚽ खेल का मैदान (Playground)</Text>
              <Text style={styles.facilityDesc}>शारीरिक विकास एवं खेलकूद गतिविधियों के लिए विशाल प्रांगण।</Text>
            </View>

            {/* Principal Message */}
            <View style={styles.principalCard}>
              <Text style={styles.principalHeader}>👨‍🏫 प्रधानाध्यापक का संदेश</Text>
              <Text style={styles.principalName}>संजय कुमार (प्रधानाध्यापक)</Text>
              <Text style={styles.principalText}>
                "हमारा लक्ष्य प्रत्येक बच्चे को गुणवत्तापूर्ण शिक्षा, नैतिक मूल्य और आधुनिक डिजिटल ज्ञान प्रदान करना है।"
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'notices' && (
          <View style={styles.tabContent}>
            <View style={styles.liveSyncHeader}>
              <Text style={styles.liveSyncText}>🔄 बैकएंड से ऑटो-सिंक (Real-Time Common API)</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 20 }} />
            ) : notices.length === 0 ? (
              <Text style={styles.emptyText}>वर्तमान में कोई नया नोटिस नहीं है।</Text>
            ) : (
              notices.map((n) => (
                <View key={n.id} style={styles.noticeCard}>
                  <View style={styles.noticeCategoryBadge}>
                    <Text style={styles.noticeCategoryText}>{n.category || 'GENERAL'}</Text>
                    {n.date && <Text style={styles.noticeDateText}>{n.date}</Text>}
                  </View>
                  <Text style={styles.noticeCardTitle}>{n.title}</Text>
                  <Text style={styles.noticeCardDesc}>{n.description}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'holidays' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>📅 आगामी विद्यालय अवकाश (Official Holidays)</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#0B1F3A" style={{ marginTop: 20 }} />
            ) : holidays.length === 0 ? (
              <Text style={styles.emptyText}>कोई आगामी अवकाश सूचीबद्ध नहीं है।</Text>
            ) : (
              holidays.map((h) => (
                <View key={h.id} style={styles.holidayCard}>
                  <View style={styles.holidayBadge}>
                    <Text style={styles.holidayBadgeText}>{h.type || 'OFFICIAL'}</Text>
                  </View>
                  <Text style={styles.holidayTitle}>{h.title}</Text>
                  {h.description ? <Text style={styles.holidayDesc}>{h.description}</Text> : null}
                  <Text style={styles.holidayDate}>
                    {h.startDate} {h.endDate && h.endDate !== h.startDate ? `से ${h.endDate}` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'portal' && (
          <View style={styles.tabContent}>
            {/* IN-APP MOBILE LOGIN FORM */}
            <View style={styles.loginFormCard}>
              <Text style={styles.portalTitle}>🔐 मोबाइल ऐप लॉगिन</Text>
              <Text style={styles.portalSubtitle}>शिक्षक व एडमिन इन-ऐप लॉगिन पोर्टल</Text>

              {authError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ईमेल / यूजरनेम (Email/Username)</Text>
                <TextInput
                  style={styles.textInput}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="admin@school.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>पासवर्ड (Password)</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, authLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>लॉगिन करें (Sign In)</Text>
                )}
              </TouchableOpacity>

              <View style={styles.credentialsHintBox}>
                <Text style={styles.credentialsHintTitle}>💡 परीक्षण खाता (Demo Credentials):</Text>
                <Text style={styles.credentialsHintText}>• Admin Email: admin@school.com | Pass: AdminSecret123!</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>📞 हेल्पलाइन: 9058347719 | Nagal, Saharanpur, UP</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    backgroundColor: '#0B1F3A',
    padding: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#D4A84F',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goldBadge: {
    backgroundColor: '#D4A84F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goldBadgeText: {
    color: '#0B1F3A',
    fontWeight: '900',
    fontSize: 10,
  },
  udiseText: {
    color: '#D4A84F',
    fontWeight: '700',
    fontSize: 11,
  },
  schoolTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  schoolSubTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  tagline: {
    color: '#D4A84F',
    fontSize: 11,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B1F3A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#D4A84F',
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0B1F3A',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 12,
    marginTop: 8,
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0B1F3A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1F3A',
  },
  facilityDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  principalCard: {
    backgroundColor: '#0B1F3A',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D4A84F',
  },
  principalHeader: {
    color: '#D4A84F',
    fontSize: 12,
    fontWeight: '800',
  },
  principalName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  principalText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
  liveSyncHeader: {
    backgroundColor: '#E0F2FE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  liveSyncText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  noticeCategoryBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeCategoryText: {
    backgroundColor: '#0B1F3A',
    color: '#D4A84F',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noticeDateText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  noticeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  noticeCardDesc: {
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
    lineHeight: 18,
  },
  holidayCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A84F',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  holidayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  holidayBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },
  holidayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1F3A',
  },
  holidayDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  holidayDate: {
    fontSize: 12,
    color: '#D4A84F',
    fontWeight: '700',
    marginTop: 6,
  },
  loginFormCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0B1F3A',
    textAlign: 'center',
  },
  portalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  loginButton: {
    backgroundColor: '#0B1F3A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D4A84F',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  credentialsHintBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  credentialsHintTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0B1F3A',
    marginBottom: 4,
  },
  credentialsHintText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 30,
    fontSize: 13,
  },
  footer: {
    backgroundColor: '#0B1F3A',
    padding: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#D4A84F',
    fontSize: 10,
    fontWeight: '700',
  },
});
