import React, { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import SampaBot from './components/SampaBot';
import SiteFooter from './components/SiteFooter';
import AboutPage from './components/pages/AboutPage';
import AcademicsPage from './components/pages/AcademicsPage';
import AdmissionsPage from './components/pages/AdmissionsPage';
import AnnouncementsPage from './components/pages/AnnouncementsPage';
import ContactPage from './components/pages/ContactPage';
import DownloadsPage from './components/pages/DownloadsPage';
import GalleryPage from './components/pages/GalleryPage';
import HomePage from './components/pages/HomePage';
import ResearchPage from './components/pages/ResearchPage';
import ServicesPage from './components/pages/ServicesPage';
import { InquiryFields } from './components/InquiryForm';
import {
  Announcement,
  CollegeSettings,
  ContactInfo,
  DownloadItem,
  FooterLink,
  GalleryItem,
  HomepageSlider,
  NewsEvent,
  Page,
  Programme,
  ResearchPublication,
  SocialLink,
  StaffProfile,
  StudentService
} from './types';

const defaultSettings: CollegeSettings = {
  collegeNameEnglish: "Trongsa College of Heritage and Contemporary Studies",
  collegeNameDzongkha: "ཀྲོང་གསར་རྒྱལ་རབས་དང་དེང་དུས་རིག་པའི་ཚན་གཙུག།",
  siteSubtitle: "College of Language and Culture Studies (CLCS), Royal University of Bhutan",
  logoUrl: "",
  secondaryLogoUrl: "",
  navbarAlert: "",
  navbarAlertTarget: "none",
  isEnrollmentOpen: true
};

const defaultContact: ContactInfo = {
  collegeName: "Trongsa College of Heritage and Contemporary Studies (CLCS)",
  address: "Taktse, Trongsa, Kingdom of Bhutan",
  phone: "+975-03-521151 / +975-03-521252",
  email: "admission.clcs@rub.edu.bt",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.4389658518925!2d90.4981113!3d27.4244444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e19bc000000001%3A0x6bba8ded013bdff1!2sCollege%20of%20Language%20and%20Culture%20Studies!5e0!3m2!1sen!2sbt!4v1700000000000!5m2!1sen!2sbt",
  workingHours: "Monday to Friday: 9:00 AM - 5:00 PM (Saturday morning library open)"
};

export default function App() {
  const [currentTab, setTab] = useState(() => window.location.pathname.replace(/\/+$/, '') === '/admin' ? 'admin' : 'home');
  const [currentSlug, setSlug] = useState<string | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [contact, setContact] = useState(defaultContact);
  const [sliders, setSliders] = useState<HomepageSlider[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [publications, setPublications] = useState<ResearchPublication[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [services, setServices] = useState<StudentService[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [inquiryFields, setInquiryFields] = useState<InquiryFields>({
    name: '',
    email: '',
    phone: '',
    subject: 'General public inquiry',
    message: ''
  });
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('clcs_admin_token'));

  const loadCollegeData = async () => {
    const fetchFresh = (url: string) => fetch(url, { cache: 'no-store' });

    try {
      const resSettings = await fetchFresh('/api/settings');
      if (resSettings.ok) {
        const data = await resSettings.json();
        if (data.settings) setSettings(data.settings);
        if (data.contactInfo) setContact(data.contactInfo);
      }

      const resSliders = await fetchFresh('/api/slider');
      if (resSliders.ok) setSliders(await resSliders.json());

      const resPages = await fetchFresh('/api/pages');
      if (resPages.ok) setPages(await resPages.json());

      const resProgrammes = await fetchFresh('/api/programmes');
      if (resProgrammes.ok) setProgrammes(await resProgrammes.json());

      const resPublications = await fetchFresh('/api/research');
      if (resPublications.ok) setPublications(await resPublications.json());

      const resAnnouncements = await fetchFresh('/api/announcements');
      if (resAnnouncements.ok) setAnnouncements(await resAnnouncements.json());

      const resNews = await fetchFresh('/api/news-events');
      if (resNews.ok) setNewsEvents(await resNews.json());

      const resStaff = await fetchFresh('/api/staff');
      if (resStaff.ok) setStaff(await resStaff.json());

      const resDownloads = await fetchFresh('/api/downloads');
      if (resDownloads.ok) setDownloads(await resDownloads.json());

      const resGallery = await fetchFresh('/api/gallery');
      if (resGallery.ok) setGallery(await resGallery.json());

      const resServices = await fetchFresh('/api/services');
      if (resServices.ok) setServices(await resServices.json());

      const resNavigation = await fetchFresh('/api/navigation');
      if (resNavigation.ok) {
        const data = await resNavigation.json();
        if (data.socialLinks) setSocialLinks(data.socialLinks);
        if (data.footerLinks) setFooterLinks(data.footerLinks);
      }
    } catch (error) {
      console.warn("Could not synchronize with college endpoint server", error);
    }
  };

  useEffect(() => {
    loadCollegeData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, currentSlug]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadCollegeData();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    if (currentTab === 'admin' && path !== '/admin') {
      window.history.replaceState({}, '', '/admin/');
    }
    if (currentTab !== 'admin' && path === '/admin') {
      window.history.replaceState({}, '', '/');
    }
  }, [currentTab]);

  const handleNavigate = (tab: string, slug: string | null = null) => {
    setTab(tab);
    setSlug(slug);
  };

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('clcs_admin_token', token);
    setTab('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('clcs_admin_token');
    setTab('home');
  };

  const handleInquiryChange = <K extends keyof InquiryFields>(field: K, value: InquiryFields[K]) => {
    setInquiryFields((fields) => ({ ...fields, [field]: value }));
  };

  const handleInquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setInquirySuccess('');
    try {
      const response = await fetch('/api/contact-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryFields)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setInquirySuccess(result.message || "Your inquiry has been successfully sent to the Registrar.");
        setInquiryFields({
          name: '',
          email: '',
          phone: '',
          subject: 'General public inquiry',
          message: ''
        });
        return;
      }
      alert("Enquiry failed to deliver. Please check all fields.");
    } catch (error) {
      alert("Trouble connecting with college server. Try again later.");
    }
  };

  const filteredDownloads = downloads.filter((download) => {
    const matchesSearch = download.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryFilter === 'All' || download.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase())
      || announcement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const selectedAnnouncementCategory = activeCategoryFilter === 'All' ? 'Announcements' : activeCategoryFilter;
    const matchesCategory = announcement.category === selectedAnnouncementCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen text-slate-800 font-sans selection:bg-[#D4AF37] selection:text-[#002366]">
      <Navbar currentTab={currentTab} setTab={setTab} setSlug={setSlug} settings={settings} contact={contact} socialLinks={socialLinks} />
      <main className="flex-grow min-w-0">
        {currentTab === 'home' && (
          <HomePage
            announcements={announcements}
            onAnnouncementSearch={(title = '', category = 'Announcements') => {
              setSearchQuery(title);
              setActiveCategoryFilter(category);
              setTab('announcements');
            }}
            onNavigate={handleNavigate}
            programmes={programmes}
            sliders={sliders}
          />
        )}
        {currentTab === 'about' && (
          <AboutPage
            currentSlug={currentSlug}
            onSelectPage={setSlug}
            pages={pages}
            staff={staff}
            gallery={gallery}
          />
        )}
        {currentTab === 'academics' && (
          <AcademicsPage
            contact={contact}
            currentSlug={currentSlug}
            downloads={downloads}
            onNavigate={(tab, slug = null) => handleNavigate(tab, slug)}
            onSelectSlug={setSlug}
            pages={pages}
            programmes={programmes}
            staff={staff}
          />
        )}
        {currentTab === 'admissions' && (
          <AdmissionsPage
            currentSlug={currentSlug}
            downloads={downloads}
            onSelectPage={setSlug}
            pages={pages}
          />
        )}
        {currentTab === 'research' && (
          <ResearchPage
            currentSlug={currentSlug}
            downloads={downloads}
            newsEvents={newsEvents}
            onSelectPage={setSlug}
            pages={pages}
          />
        )}
        {currentTab === 'services' && (
          <ServicesPage
            currentSlug={currentSlug}
            onSelectSlug={setSlug}
            services={services}
          />
        )}
        {currentTab === 'announcements' && (
          <AnnouncementsPage
            activeCategoryFilter={activeCategoryFilter}
            announcements={filteredAnnouncements}
            onCategoryChange={setActiveCategoryFilter}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        )}
        {currentTab === 'gallery' && (
          <GalleryPage
            gallery={gallery}
            lightboxImage={lightboxImage}
            onCloseLightbox={() => setLightboxImage(null)}
            onOpenLightbox={setLightboxImage}
          />
        )}
        {currentTab === 'downloads' && (
          <DownloadsPage
            activeCategoryFilter={activeCategoryFilter}
            downloads={filteredDownloads}
            onCategoryChange={setActiveCategoryFilter}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        )}
        {currentTab === 'contact' && (
          <ContactPage
            contact={contact}
            inquiryFields={inquiryFields}
            inquirySuccess={inquirySuccess}
            onInquiryChange={handleInquiryChange}
            onInquirySubmit={handleInquirySubmit}
          />
        )}
        {currentTab === 'admin' && (
          <AdminDashboard
            token={adminToken}
            onLoginSuccess={handleAdminLogin}
            onLogout={handleAdminLogout}
            settings={settings}
            contact={contact}
            onRefetchData={loadCollegeData}
          />
        )}
      </main>
      <SampaBot />
      <SiteFooter adminActive={!!adminToken} contact={contact} footerLinks={footerLinks} onNavigate={handleNavigate} settings={settings} socialLinks={socialLinks} />
    </div>
  );
}
