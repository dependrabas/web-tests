import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, GraduationCap, Instagram, Linkedin, Link2, MapPin, Megaphone, Menu, Phone, Twitter, X, Youtube } from 'lucide-react';
import { CollegeSettings, ContactInfo, SocialLink } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  setSlug: (slug: string | null) => void;
  settings: CollegeSettings;
  contact: ContactInfo;
  socialLinks: SocialLink[];
}

export default function Navbar({
  currentTab,
  setTab,
  setSlug,
  settings,
  contact,
  socialLinks
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [secondaryLogoFailed, setSecondaryLogoFailed] = useState(false);
  const [mastheadVisible, setMastheadVisible] = useState(true);
  const mastheadVisibleRef = useRef(true);

  useEffect(() => {
    setLogoFailed(false);
  }, [settings.logoUrl]);

  useEffect(() => {
    setSecondaryLogoFailed(false);
  }, [settings.secondaryLogoUrl]);

  useEffect(() => {
    let previousScrollY = Math.max(window.scrollY, 0);
    let accumulatedDistance = 0;
    let lastDirection: 'up' | 'down' | null = null;
    let lockedUntil = 0;
    let frameId = 0;

    const setMasthead = (nextVisible: boolean) => {
      if (mastheadVisibleRef.current === nextVisible) return;

      mastheadVisibleRef.current = nextVisible;
      setMastheadVisible(nextVisible);
      lockedUntil = Date.now() + 360;
      accumulatedDistance = 0;
    };

    const handleScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;

        const currentScrollY = Math.max(window.scrollY, 0);
        const now = Date.now();
        const scrollDelta = currentScrollY - previousScrollY;
        previousScrollY = currentScrollY;

        if (currentScrollY < 32) {
          setMasthead(true);
          lastDirection = null;
          return;
        }

        if (now < lockedUntil || Math.abs(scrollDelta) < 4) return;

        const currentDirection: 'up' | 'down' = scrollDelta > 0 ? 'down' : 'up';
        if (lastDirection !== currentDirection) {
          lastDirection = currentDirection;
          accumulatedDistance = 0;
        }

        accumulatedDistance += Math.abs(scrollDelta);

        if (currentDirection === 'down' && mastheadVisibleRef.current && currentScrollY > 120 && accumulatedDistance > 90) {
          setMasthead(false);
        } else if (currentDirection === 'up' && !mastheadVisibleRef.current && accumulatedDistance > 80) {
          setMasthead(true);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const labels = {
    home: "Home",
    about: "About",
    academics: "Academics",
    research: "Research",
    services: "Student Services",
    announcements: "Announcements"
  };

  const menuItems = [
    { id: 'home', label: labels.home },
    { id: 'about', label: labels.about },
    { id: 'academics', label: labels.academics },
    { id: 'research', label: labels.research },
    { id: 'services', label: labels.services },
    { id: 'announcements', label: labels.announcements }
  ];

  const alertTarget = settings.navbarAlertTarget || 'admissions';
  const [alertTab, alertSlug] = alertTarget.split(':');

  const handleTabChange = (tabId: string) => {
    setTab(tabId);
    setSlug(null);
    setMobileMenuOpen(false);
  };

  const handleAlertClick = () => {
    setTab(alertTab);
    setSlug(alertSlug || null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full z-50 bg-white/88 shadow-lg shadow-slate-900/8 sticky top-0 backdrop-blur-xl border-b border-white/70">
      {/* Dynamic Announcement Alert Tape */}
      {settings.navbarAlert && (
        <div className="bg-clcs-maroon text-white text-xs py-2 px-4 flex items-center justify-between text-center font-medium border-b border-clcs-gold/30">
          {alertTarget === 'none' ? (
            <span className="mx-auto flex items-center justify-center gap-2">
              <Megaphone className="w-3.5 h-3.5 text-clcs-gold flex-shrink-0" />
              <span>{settings.navbarAlert}</span>
            </span>
          ) : (
            <button
              onClick={handleAlertClick}
              className="mx-auto flex items-center justify-center gap-2 animate-pulse hover:text-clcs-gold transition cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-clcs-gold flex-shrink-0" />
              <span>{settings.navbarAlert}</span>
            </button>
          )}
        </div>
      )}

      {/* Top Meta Hub */}
      <div className="bg-[#0b2341] text-white text-xs py-2 hidden md:block border-b border-clcs-gold/10">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 items-center font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-clcs-gold" /> {contact.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-clcs-gold" /> {contact.phone.split('/')[0]}
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            {socialLinks.map((link) => {
              const SocialIcon = {
                facebook: Facebook,
                youtube: Youtube,
                twitter: Twitter,
                instagram: Instagram,
                linkedin: Linkedin
              }[link.platform] || Link2;

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.platform}
                  title={link.platform}
                  className="p-1.5 rounded text-slate-200 hover:bg-white/10 hover:text-clcs-gold transition"
                >
                  <SocialIcon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand Identity / Seal Line */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${mastheadVisible ? 'max-h-44 sm:max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <button
            type="button"
            onClick={() => handleTabChange('home')}
            className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5 text-left cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden">
              {settings.logoUrl && !logoFailed ? (
                <img
                  src={settings.logoUrl}
                  alt={`${settings.collegeNameEnglish} logo`}
                  className="w-full h-full object-contain bg-white p-1"
                  decoding="async"
                  loading="eager"
                  onError={() => setLogoFailed(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11 text-clcs-maroon" />
              )}
            </div>

            <div className="min-w-0 text-center clcs-brand-text">
              {settings.collegeNameDzongkha && (
                <div lang="dz" className="clcs-dzongkha-title text-[#6b3b12] text-base sm:text-2xl lg:text-4xl">
                  {settings.collegeNameDzongkha}
                </div>
              )}
              <h1 className="text-clcs-navy font-sans font-extrabold text-[12px] sm:text-xl lg:text-3xl leading-tight line-clamp-2">
                {settings.collegeNameEnglish}
              </h1>
              <p className="text-clcs-navy text-[10px] sm:text-base lg:text-xl leading-tight font-medium line-clamp-1">
                {settings.siteSubtitle}
              </p>
            </div>

            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white flex items-center justify-center overflow-hidden">
              {settings.secondaryLogoUrl && !secondaryLogoFailed && (
                <img
                  src={settings.secondaryLogoUrl}
                  alt="Royal University of Bhutan logo"
                  className="w-full h-full object-contain bg-white"
                  decoding="async"
                  loading="eager"
                  onError={() => setSecondaryLogoFailed(true)}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Bhutanese Color Accent Trim */}
      <div className="bhutanese-trim"></div>

      {/* Primary Links Hub */}
      <div className="bg-white/86 text-slate-700 text-sm border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center min-h-12">
          {/* Main Desktop Links */}
          <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2 min-h-12">
            {menuItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`min-h-11 px-3 lg:px-5 flex items-center justify-center text-center font-bold transition-all duration-150 relative cursor-pointer rounded-lg whitespace-nowrap ${
                    active ? 'text-white bg-clcs-navy shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-clcs-maroon'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="md:hidden flex items-center justify-between w-full">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-clcs-navy hover:text-clcs-maroon focus:outline-none p-2 ml-auto cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white text-slate-700 border-t border-slate-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition hover:bg-slate-100 hover:text-clcs-maroon ${
                      currentTab === item.id ? 'bg-clcs-navy text-white' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
