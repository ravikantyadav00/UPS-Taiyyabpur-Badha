'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ShieldCheck, Check } from 'lucide-react';

export default function AppInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('UPS Taiyyabpur Badha स्कूल ऐप इंस्टॉल करने के लिए अपने ब्राउज़र मेनू (⋮) में जाएं और "Add to Home Screen" या "Install App" पर क्लिक करें।');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isDismissed || installed) return null;

  return (
    <div className="bg-gradient-to-r from-[#0B1F3A] via-[#1E3A8A] to-[#0B1F3A] text-white py-3 px-4 shadow-lg border-b border-[#D4A84F]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-[#D4A84F]/20 border border-[#D4A84F] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#D4A84F]" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white">
                ইউ.पी.एस. तैय्यबपुर बढ़ा - Mobile App
              </span>
              <span className="bg-[#D4A84F] text-[#0B1F3A] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Official App
              </span>
            </div>
            <p className="text-xs text-blue-100/90 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
              डिजिटल अटेंडेंस, रिजल्ट, नोटिस बोर्ड एवं ऑल-इन-वन स्कूल एंड्रॉइड ऐप
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#D4A84F] hover:bg-[#b88f3a] text-[#0B1F3A] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            डाउनलोड स्कूल ऐप (Install)
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:bg-white/10 text-blue-200 hover:text-white rounded-lg transition-colors"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
