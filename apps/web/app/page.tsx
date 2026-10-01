'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  School,
  BookOpen,
  Users,
  Award,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Laptop,
  Trophy,
  User,
  LogIn,
  Menu,
  X,
  Droplets,
  Library,
  GraduationCap,
  Loader2,
  ZoomIn,
  ChevronLeft,
  ArrowUpRight,
  Sliders
} from 'lucide-react';

import { apiFetch } from '@/lib/api';

interface Holiday {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
}

interface Notice {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
}

interface SchoolInfo {
  id?: string;
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  principalName?: string;
  udiseCode?: string;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
}

export default function PremiumSchoolHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<'soft' | 'glass' | 'medium'>('soft');
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: 'UPS Taiyyabpur Badha',
    address: 'Vill. Taiyyabpur Badha, Nagal, Saharanpur, Uttar Pradesh',
    phone: '9058347719',
    principalName: 'Sanjay Kumar',
    udiseCode: '09011101603',
  });

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && gallery.length > 0 ? (prev - 1 + gallery.length) % gallery.length : null));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && gallery.length > 0 ? (prev + 1) % gallery.length : null));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, gallery.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [nData, hData, sData, gData] = await Promise.all([
          apiFetch<Notice[]>('/notices'),
          apiFetch<Holiday[]>('/holidays'),
          apiFetch<SchoolInfo>('/schools/me'),
          apiFetch<GalleryItem[]>('/gallery')
        ]);
        if (Array.isArray(nData)) setNotices(nData);
        if (Array.isArray(hData)) {
          setHolidays(hData);
        }
        if (Array.isArray(gData)) {
          setGallery(gData);
        }
        if (sData && typeof sData === 'object') {
          setSchoolInfo(prev => ({ ...prev, ...sData }));
        }
      } catch (err) {
        console.error('Failed to load notices/holidays/school profile/gallery', err);
      } finally {
        setHolidaysLoading(false);
      }
    }

    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mock_db_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mock_db_updated', handleStorageChange);
    };
  }, []);

  const stats = [
    { label: 'Students (विद्यार्थी)', value: '350+' },
    { label: 'Teachers (शिक्षक)', value: '10' },
    { label: 'Classes (कक्षाएं)', value: '8' },
    { label: 'Grades Offered', value: '1–8' },
  ];

  const facilities = [
    {
      id: 'smart-class',
      title: 'Smart Class',
      titleHindi: 'स्मार्ट क्लास',
      desc: 'Modern digital learning environment for interactive education.',
      icon: Laptop,
    },
    {
      id: 'computer-lab',
      title: 'Computer Lab',
      titleHindi: 'कंप्यूटर लैब',
      desc: 'Students get opportunities to develop computer and digital learning skills.',
      icon: Laptop,
    },
    {
      id: 'library',
      title: 'Library',
      titleHindi: 'पुस्तकालय',
      desc: 'A learning and reading space for students to explore books.',
      icon: Library,
    },
    {
      id: 'playground',
      title: 'Playground',
      titleHindi: 'खेल का मैदान',
      desc: 'Space for physical activity and outdoor learning.',
      icon: Trophy,
    },
    {
      id: 'drinking-water',
      title: 'Drinking Water',
      titleHindi: 'पेयजल सुविधा',
      desc: 'Access to clean drinking water for students.',
      icon: Droplets,
    },
  ];

  const primaryClasses = [
    { grade: 'Class 1', title: 'कक्षा 1', desc: 'बुनियादी साक्षरता एवं कौशल विकास' },
    { grade: 'Class 2', title: 'कक्षा 2', desc: 'पठन-पाठन एवं प्राथमिक गणितीय समझ' },
    { grade: 'Class 3', title: 'कक्षा 3', desc: 'विषयगत दक्षता एवं अभिव्यक्ति' },
    { grade: 'Class 4', title: 'कक्षा 4', desc: 'पर्यावरण एवं शैक्षणिक सुदृढ़ीकरण' },
    { grade: 'Class 5', title: 'कक्षा 5', desc: 'प्राथमिक स्तर की पूर्णता एवं तैयारी' },
  ];

  const upperPrimaryClasses = [
    { grade: 'Class 6', title: 'कक्षा 6', desc: 'उच्च प्राथमिक विषयवार गहन अध्ययन' },
    { grade: 'Class 7', title: 'कक्षा 7', desc: 'विज्ञान, गणित एवं तकनीकी समझ' },
    { grade: 'Class 8', title: 'कक्षा 8', desc: 'सर्वांगीण विकास एवं अग्रिम शिक्षा तैयारी' },
  ];

  return (
    <div id="top" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8F6F0] text-[#172033] font-sans selection:bg-[#D4A84F] selection:text-[#0B1F3A]">
      {/* Top Bar */}
      <div className="bg-[#0B1F3A] text-white text-xs py-2.5 px-4 font-medium border-b border-[#D4A84F]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#D4A84F] flex-shrink-0" />
              <span>Vill. Taiyyabpur Badha, Nagal, Saharanpur, UP</span>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline font-mono text-slate-300">
              UDISE Code: <strong className="text-[#D4A84F]">09011101603</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs ml-auto sm:ml-0">
            <a href="tel:9058347719" className="hover:text-[#D4A84F] transition-colors flex items-center gap-1.5 font-semibold text-slate-200">
              <Phone className="w-3.5 h-3.5 text-[#D4A84F] flex-shrink-0" />
              <span>9058347719</span>
            </a>
            <span className="text-slate-500">|</span>
            <Link
              href="/login"
              className="text-xs font-bold text-[#D4A84F] hover:underline flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4A84F]" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E2DFD7] shadow-md py-3'
          : 'bg-[#F8F6F0]/90 backdrop-blur-sm border-b border-[#E2DFD7]/60 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & School Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-[#D4A84F] shadow-sm border border-[#D4A84F]/40 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#0B1F3A] group-hover:text-[#D4A84F] transition-colors leading-snug">
                UPS Taiyyabpur Badha
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B] font-medium leading-none mt-0.5">
                यू.पी.एस. तैय्यबपुर बढ़ा • Nagal, Saharanpur
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-semibold text-[#172033]">
            <a href="#top" className="hover:text-[#0B1F3A] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#0B1F3A] transition-colors">About</a>
            <a href="#classes" className="hover:text-[#0B1F3A] transition-colors">Academics</a>
            <a href="#facilities" className="hover:text-[#0B1F3A] transition-colors">Facilities</a>
            <a href="#notices" className="hover:text-[#0B1F3A] transition-colors">Notices</a>
            <a href="#contact" className="hover:text-[#0B1F3A] transition-colors">Contact</a>
          </nav>

          {/* Right Action: Staff Login */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-[#0B1F3A] bg-white border border-[#0B1F3A]/20 hover:border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#E2DFD7] text-[#172033] hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E2DFD7] px-4 pt-3 pb-5 space-y-2 mt-3 shadow-lg">
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              About
            </a>
            <a
              href="#classes"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              Academics
            </a>
            <a
              href="#facilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              Facilities
            </a>
            <a
              href="#notices"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              Notices
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#172033] hover:bg-[#F8F6F0]"
            >
              Contact
            </a>
            <div className="pt-2 border-t border-[#E2DFD7]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-4 py-2.5 text-xs font-semibold text-center text-[#0B1F3A] bg-[#F8F6F0] border border-[#0B1F3A]/20 rounded-xl flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Staff Login</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative w-full max-w-full overflow-x-hidden">

        {/* HERO SECTION */}
        <section className="relative py-12 sm:py-16 lg:py-24 border-b border-[#E2DFD7]/80 overflow-hidden bg-gradient-to-b from-[#F8F6F0] to-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Hero Content */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
                
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0B1F3A]/5 border border-[#0B1F3A]/15 text-[#0B1F3A]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A84F] flex-shrink-0" />
                  <span>OFFICIAL SCHOOL WEBSITE</span>
                </div>

                {/* Primary Page Heading (Single H1) */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0B1F3A] leading-tight">
                  UPS Taiyyabpur Badha
                </h1>

                {/* Secondary Hindi Motto */}
                <p className="text-xl sm:text-2xl font-bold text-[#D4A84F] tracking-wide">
                  ज्ञान • संस्कार • विकास
                </p>

                {/* Subtext */}
                <p className="text-sm sm:text-base lg:text-lg text-[#64748B] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                  "कक्षा 1 से 8 तक गुणवत्तापूर्ण शिक्षा और बच्चों के सर्वांगीण विकास के लिए समर्पित विद्यालय।"
                </p>

                {/* Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                  <a
                    href="#about"
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-[#0B1F3A] hover:bg-[#16325c] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>विद्यालय के बारे में</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A84F]" />
                  </a>
                  <a
                    href="#notices"
                    className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-[#0B1F3A] bg-white border border-[#E2DFD7] hover:border-[#0B1F3A] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Bell className="w-4 h-4 text-[#0B1F3A]" />
                    <span>नोटिस देखें</span>
                  </a>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-6 relative">
                <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#E2DFD7] shadow-xl relative space-y-3">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E2DFD7]">
                    <img
                      src="/images/school-building.jpg"
                      alt="UPS Taiyyabpur Badha Composite School Campus, Saharanpur"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3 sm:p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2DFD7] shadow-md flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#0B1F3A]">UPS Taiyyabpur Badha Composite</div>
                        <div className="text-[11px] text-[#64748B]">Nagal, Saharanpur, Uttar Pradesh</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#0B1F3A] text-[#D4A84F] shrink-0">
                        UDISE: 09011101603
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-10 bg-white border-b border-[#E2DFD7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((st, idx) => (
                <div key={idx} className="h-full p-5 sm:p-6 text-center bg-[#FAF8F5] border border-[#E2DFD7] rounded-2xl shadow-sm flex flex-col justify-center items-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#0B1F3A]">{st.value}</div>
                  <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1.5">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 sm:py-20 lg:py-24 border-b border-[#E2DFD7] bg-[#F8F6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-[#0B1F3A]/5 text-[#0B1F3A] border border-[#0B1F3A]/10">
                  हमारे विद्यालय के बारे में
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A] leading-snug">
                  UPS Taiyyabpur Badha
                </h2>
                <p className="text-[#172033] text-sm sm:text-base leading-relaxed">
                  UPS Taiyyabpur Badha is located in <strong>Vill. Taiyyabpur Badha, Nagal, Saharanpur, Uttar Pradesh</strong> and provides education from <strong>Class 1 to Class 8</strong>.
                </p>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  The school focuses on quality education, children's overall development, digital learning skills, sports, and maintaining a positive, encouraging learning environment.
                </p>

                {/* Verified Facilities List */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] mb-3">उपलब्ध सुविधाएं (Facilities):</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-[#172033]">
                    <div className="p-3 rounded-xl bg-white border border-[#E2DFD7] flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A84F] shrink-0" /> Smart Class
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E2DFD7] flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A84F] shrink-0" /> Computer Lab
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E2DFD7] flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A84F] shrink-0" /> Library
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E2DFD7] flex items-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A84F] shrink-0" /> Playground
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E2DFD7] flex items-center gap-2 sm:col-span-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A84F] shrink-0" /> Drinking Water
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Card Showcase */}
              <div className="lg:col-span-6">
                <div className="bg-white p-4 rounded-3xl border border-[#E2DFD7] shadow-lg space-y-4">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E2DFD7]">
                    <img
                      src="/images/school-midday-meal.jpg"
                      alt="Students having Mid-Day Meal at UPS Taiyyabpur Badha"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2DFD7] text-xs font-bold text-[#0B1F3A] flex justify-between items-center">
                      <span>मध्याह्न भोजन (Mid-Day Meal)</span>
                      <span className="text-[#D4A84F]">UPS Taiyyabpur Badha</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DFD7] space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#E2DFD7] pb-2">
                      <span className="text-[#64748B]">School Name</span>
                      <span className="font-bold text-[#0B1F3A] text-right">UPS Taiyyabpur Badha</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E2DFD7] pb-2">
                      <span className="text-[#64748B]">UDISE Code</span>
                      <span className="font-mono font-bold text-[#0B1F3A]">09011101603</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Location</span>
                      <span className="font-bold text-[#0B1F3A] text-right">Vill. Taiyyabpur Badha, Nagal, Saharanpur</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRINCIPAL SECTION */}
        <section id="principal" className="py-16 sm:py-20 bg-white border-b border-[#E2DFD7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-[#FAF8F5] p-6 sm:p-12 rounded-3xl border border-[#E2DFD7] space-y-6 shadow-sm">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#0B1F3A] border-2 border-[#D4A84F] flex items-center justify-center text-[#D4A84F] shadow-md">
                <User className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">प्रधानाध्यापक की ओर से</span>
                <h2 className="text-2xl font-extrabold text-[#0B1F3A]">{schoolInfo.principalName || 'Sanjay Kumar'}</h2>
                <p className="text-xs text-[#64748B] font-semibold">प्रधानाध्यापक / Head • {schoolInfo.name || 'UPS Taiyyabpur Badha'}</p>
              </div>

              <blockquote className="text-[#172033] text-base sm:text-lg leading-relaxed italic max-w-2xl mx-auto">
                "हमारा उद्देश्य प्रत्येक बच्चे को सीखने, आगे बढ़ने और अपनी क्षमताओं को विकसित करने के लिए एक सकारात्मक एवं सहयोगी वातावरण प्रदान करना है।"
              </blockquote>
            </div>
          </div>
        </section>

        {/* ACADEMICS SECTION */}
        <section id="classes" className="py-16 sm:py-20 lg:py-24 border-b border-[#E2DFD7] bg-[#F8F6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">कक्षा 1 से 8 तक शिक्षा</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                Academic Structure
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Primary Wing */}
              <div className="h-full bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DFD7] space-y-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#0B1F3A]/5 text-[#0B1F3A]">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0B1F3A]">PRIMARY WING</h3>
                        <p className="text-xs text-[#64748B]">Classes 1–5</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4A84F]/15 text-[#0B1F3A]">
                      कक्षा 1 से 5
                    </span>
                  </div>

                  <div className="space-y-3">
                    {primaryClasses.map((item, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DFD7] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 sm:gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#0B1F3A] bg-white px-2.5 py-1 rounded-md border border-[#E2DFD7] shrink-0">
                            {item.grade}
                          </span>
                          <span className="font-bold text-[#172033]">{item.title}</span>
                        </div>
                        <span className="text-[#64748B] text-[11px] sm:text-xs">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upper Primary Wing */}
              <div className="h-full bg-white p-6 sm:p-8 rounded-3xl border border-[#E2DFD7] space-y-6 shadow-sm flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E2DFD7] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#0B1F3A]/5 text-[#0B1F3A]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0B1F3A]">UPPER PRIMARY WING</h3>
                        <p className="text-xs text-[#64748B]">Classes 6–8</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B1F3A]/10 text-[#0B1F3A]">
                      कक्षा 6 से 8
                    </span>
                  </div>

                  <div className="space-y-3">
                    {upperPrimaryClasses.map((item, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DFD7] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 sm:gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#0B1F3A] bg-white px-2.5 py-1 rounded-md border border-[#E2DFD7] shrink-0">
                            {item.grade}
                          </span>
                          <span className="font-bold text-[#172033]">{item.title}</span>
                        </div>
                        <span className="text-[#64748B] text-[11px] sm:text-xs">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FACILITIES SECTION */}
        <section id="facilities" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#E2DFD7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">सुविधाएं</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                विद्यालय की सुविधाएँ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {facilities.map((fac) => {
                const IconComp = fac.icon;
                return (
                  <div key={fac.id} className="h-full bg-[#FAF8F5] p-6 rounded-2xl border border-[#E2DFD7] space-y-3 flex flex-col justify-between hover:border-[#0B1F3A]/40 transition-all shadow-sm hover:shadow-md">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-[#D4A84F] flex items-center justify-center mb-4 shrink-0 shadow-sm">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0B1F3A]">{fac.title}</h3>
                      <p className="text-[11px] font-semibold text-[#D4A84F] mt-0.5">{fac.titleHindi}</p>
                      <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{fac.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* NOTICE BOARD SECTION */}
        <section id="notices" className="py-16 sm:py-20 lg:py-24 bg-[#F8F6F0] border-b border-[#E2DFD7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 border-b border-[#E2DFD7] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">सूचना पट्ट</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1">नवीनतम सूचनाएं (Latest Notices)</h2>
              </div>
              <a
                href="#notices"
                className="px-4 py-2 text-xs font-bold text-[#0B1F3A] bg-white border border-[#E2DFD7] hover:border-[#0B1F3A] rounded-xl transition-colors shadow-sm"
              >
                सभी नोटिस देखें
              </a>
            </div>

            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.map((n) => (
                  <div key={n.id} className="bg-white p-6 rounded-2xl border border-[#E2DFD7] space-y-2 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#0B1F3A]/5 text-[#0B1F3A] border border-[#0B1F3A]/10">
                        {n.category}
                      </span>
                      <span className="text-[#64748B] font-mono">{n.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#0B1F3A]">{n.title}</h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{n.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-[#E2DFD7] text-center space-y-2 shadow-sm">
                  <Bell className="w-8 h-8 text-[#64748B] mx-auto" />
                  <p className="text-sm font-semibold text-[#0B1F3A]">वर्तमान में कोई नई सूचना उपलब्ध नहीं है।</p>
                  <p className="text-xs text-[#64748B]">सभी नवीनतम सूचनाएं समय-समय पर यहाँ प्रकाशित की जाएँगी।</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DYNAMIC UPCOMING HOLIDAYS SECTION */}
        <section id="holidays" className="py-16 sm:py-20 bg-white border-b border-[#E2DFD7]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">कैलेंडर</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                आगामी अवकाश (Upcoming Holidays)
              </h2>
            </div>

            {holidaysLoading ? (
              <div className="flex items-center justify-center py-10 text-xs text-[#64748B] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B1F3A]" />
                <span>अवकाश सूची लोड हो रही है...</span>
              </div>
            ) : holidays.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {holidays.map((h) => (
                  <div key={h.id} className="h-full bg-[#FAF8F5] p-5 rounded-2xl border border-[#E2DFD7] space-y-2 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#0B1F3A]/10 text-[#0B1F3A] font-bold text-[11px]">
                          {h.type || 'अवकाश'}
                        </span>
                        <span className="text-[#64748B] font-mono text-[11px]">
                          {new Date(h.startDate).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0B1F3A]">{h.title}</h3>
                      {h.description && (
                        <p className="text-xs text-[#64748B] leading-relaxed mt-1">{h.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FAF8F5] p-8 rounded-2xl border border-[#E2DFD7] text-center space-y-2 max-w-md mx-auto shadow-sm">
                <Calendar className="w-8 h-8 text-[#64748B] mx-auto" />
                <p className="text-sm font-semibold text-[#0B1F3A]">वर्तमान में कोई नया आगामी अवकाश घोषित नहीं है।</p>
                <p className="text-xs text-[#64748B]">नियमित कक्षाएं एवं पठन-पाठन कार्य सुचारू रूप से जारी है।</p>
              </div>
            )}
          </div>
        </section>

        {/* PHOTO GALLERY SECTION */}
        <section id="gallery" className="py-12 sm:py-16 bg-[#F8F6F0] border-b border-[#E2DFD7] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 sm:w-12 bg-[#D4A84F]/60"></span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C59B27]">
                  फ़ोटो गैलरी
                </span>
                <span className="h-px w-8 sm:w-12 bg-[#D4A84F]/60"></span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
                School Gallery
              </h2>

              {/* Text Background / Shadow Controller */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                <span className="text-[#64748B] font-semibold flex items-center gap-1 mr-1 text-[11px] sm:text-xs">
                  <Sliders className="w-3.5 h-3.5 text-[#D4A84F]" /> टेक्स्ट बैकग्राउंड:
                </span>
                <button
                  onClick={() => setOverlayStyle('soft')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    overlayStyle === 'soft'
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                      : 'bg-white text-[#64748B] hover:text-[#0B1F3A] border border-[#E2DFD7]'
                  }`}
                >
                  🌤️ हल्का (Soft)
                </button>
                <button
                  onClick={() => setOverlayStyle('glass')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    overlayStyle === 'glass'
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                      : 'bg-white text-[#64748B] hover:text-[#0B1F3A] border border-[#E2DFD7]'
                  }`}
                >
                  ✨ ग्लास चिप (Glass)
                </button>
                <button
                  onClick={() => setOverlayStyle('medium')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    overlayStyle === 'medium'
                      ? 'bg-[#0B1F3A] text-[#D4A84F] shadow-sm'
                      : 'bg-white text-[#64748B] hover:text-[#0B1F3A] border border-[#E2DFD7]'
                  }`}
                >
                  🌙 मीडियम (Medium)
                </button>
              </div>
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                {gallery.map((item, index) => (
                  <div
                    key={item.id || index}
                    onClick={() => setLightboxIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLightboxIndex(index);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View photo: ${item.title}`}
                    className="group relative bg-white rounded-[20px] overflow-hidden border border-[#E2DFD7] shadow-sm hover:shadow-xl hover:shadow-[#0B1F3A]/10 hover:border-[#D4A84F]/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4A84F]"
                  >
                    {/* Image Aspect Container (16:9) */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/school-building.jpg';
                        }}
                      />
                      
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Center View/Magnifying Glass Icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0B1F3A]/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg transform opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out group-hover:bg-[#D4A84F] group-hover:text-[#0B1F3A] group-hover:border-[#D4A84F]">
                          <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* Bottom Caption Overlay based on selected Overlay Style */}
                      {overlayStyle === 'glass' ? (
                        <div className="absolute inset-x-3 bottom-3 p-2.5 sm:p-3 rounded-xl bg-[#0B1F3A]/65 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3 text-white shadow-lg">
                          <div className="space-y-0.5 min-w-0 flex-1">
                            {item.category && (
                              <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#D4A84F] text-[#0B1F3A] rounded">
                                {item.category}
                              </span>
                            )}
                            <h3 className="font-bold text-xs leading-snug line-clamp-1 text-white">
                              {item.title}
                            </h3>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center shrink-0 group-hover:bg-[#D4A84F] group-hover:text-[#0B1F3A] group-hover:border-[#D4A84F] group-hover:translate-x-0.5 transition-all duration-300">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`absolute inset-x-0 bottom-0 px-4 sm:px-5 flex items-end justify-between gap-3 text-white transition-all duration-300 ${
                            overlayStyle === 'soft'
                              ? 'pt-8 pb-3.5 bg-gradient-to-t from-black/65 via-black/15 to-transparent'
                              : 'pt-10 pb-4 bg-gradient-to-t from-[#0B1F3A]/85 via-[#0B1F3A]/45 to-transparent'
                          }`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            {item.category && (
                              <span className="inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#D4A84F] text-[#0B1F3A] rounded-md">
                                {item.category}
                              </span>
                            )}
                            <h3 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 text-slate-100 group-hover:text-white transition-colors drop-shadow-sm">
                              {item.title}
                            </h3>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shrink-0 group-hover:bg-[#D4A84F] group-hover:text-[#0B1F3A] group-hover:border-[#D4A84F] group-hover:translate-x-1 transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-[#E2DFD7] text-center space-y-2 max-w-md mx-auto shadow-sm">
                <p className="text-sm font-semibold text-[#0B1F3A]">गैलरी में फ़ोटो शीघ्र ही अपलोड की जाएँगी।</p>
                <p className="text-xs text-[#64748B]">UPS Taiyyabpur Badha</p>
              </div>
            )}
          </div>

          {/* LIGHTBOX MODAL */}
          {lightboxIndex !== null && gallery[lightboxIndex] && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B1F3A]/90 backdrop-blur-md animate-fade-in"
              onClick={() => setLightboxIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Image lightbox"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white border border-white/20 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A84F]"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Previous */}
              {gallery.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length);
                  }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white border border-white/20 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A84F]"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Navigation Next */}
              {gallery.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % gallery.length);
                  }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-[#D4A84F] hover:text-[#0B1F3A] text-white border border-white/20 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A84F]"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Lightbox Image Container */}
              <div
                className="relative max-w-5xl w-full max-h-[90vh] bg-[#0B1F3A] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex-1 flex items-center justify-center bg-black/60 p-2 sm:p-4 min-h-[300px] sm:min-h-[450px]">
                  <img
                    src={gallery[lightboxIndex].imageUrl}
                    alt={gallery[lightboxIndex].title}
                    className="max-h-[75vh] w-auto max-w-full object-contain mx-auto rounded-lg"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-[#0B1F3A] border-t border-white/10 text-white flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    {gallery[lightboxIndex].category && (
                      <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-[#D4A84F] text-[#0B1F3A] rounded">
                        {gallery[lightboxIndex].category}
                      </span>
                    )}
                    <p className="text-sm sm:text-base font-bold text-slate-100">
                      {gallery[lightboxIndex].title}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 shrink-0 font-medium">
                    {lightboxIndex + 1} / {gallery.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4A84F]">संपर्क</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B1F3A]">
                संपर्क करें (Contact Us)
              </h2>
            </div>

            <div className="max-w-3xl mx-auto bg-[#FAF8F5] p-6 sm:p-10 lg:p-12 rounded-3xl border border-[#E2DFD7] shadow-sm space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                
                <div className="p-5 rounded-2xl bg-white border border-[#E2DFD7] space-y-2 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4A84F] flex items-center gap-1.5">
                    <School className="w-4 h-4 shrink-0" /> School Name
                  </div>
                  <div className="font-extrabold text-[#0B1F3A] text-base">{schoolInfo.name || 'UPS Taiyyabpur Badha'}</div>
                  <div className="text-xs text-[#64748B]">उच्च प्राथमिक विद्यालय (Upper Primary School)</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2DFD7] space-y-2 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4A84F] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0" /> Address
                  </div>
                  <div className="font-extrabold text-[#0B1F3A] text-base leading-snug">
                    {schoolInfo.address || 'Vill. Taiyyabpur Badha, Nagal, Saharanpur, Uttar Pradesh'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2DFD7] space-y-2 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4A84F] flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" /> Phone
                  </div>
                  <div className="font-mono font-extrabold text-[#0B1F3A] text-base">{schoolInfo.phone || '9058347719'}</div>
                  <div className="pt-2">
                    <a
                      href={`tel:${schoolInfo.phone || '9058347719'}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1F3A] text-white hover:bg-[#16325c] transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#D4A84F]" /> Call School
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E2DFD7] space-y-2 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#D4A84F] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" /> UDISE Code
                  </div>
                  <div className="font-mono font-extrabold text-[#0B1F3A] text-base">{schoolInfo.udiseCode || schoolInfo.code || '09011101603'}</div>
                  <div className="text-xs text-[#64748B]">Classes 1 to 8</div>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B1F3A] text-white border-t border-[#D4A84F]/30 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-extrabold text-sm">
              <School className="w-4 h-4 text-[#D4A84F]" />
              <span>{schoolInfo.name || 'UPS Taiyyabpur Badha'}</span>
            </div>
            <p className="text-slate-300">{schoolInfo.address || 'Vill. Taiyyabpur Badha, Nagal, Saharanpur, Uttar Pradesh'}</p>
            <p className="font-mono text-[11px] text-[#D4A84F]">UDISE Code: {schoolInfo.udiseCode || schoolInfo.code || '09011101603'} | Phone: {schoolInfo.phone || '9058347719'}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-200">
            <a href="#top" className="hover:text-[#D4A84F] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#D4A84F] transition-colors">About</a>
            <a href="#classes" className="hover:text-[#D4A84F] transition-colors">Academics</a>
            <a href="#facilities" className="hover:text-[#D4A84F] transition-colors">Facilities</a>
            <a href="#notices" className="hover:text-[#D4A84F] transition-colors">Notices</a>
            <a href="#contact" className="hover:text-[#D4A84F] transition-colors">Contact</a>
            <Link href="/login" className="hover:text-[#D4A84F] transition-colors">Staff Login</Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400">
            © 2026 {schoolInfo.name || 'UPS Taiyyabpur Badha'}. All Rights Reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
