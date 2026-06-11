import React, { useState, useEffect } from 'react';
import { 
  Lock, Settings, Layers, Megaphone, Users, Landmark, CalendarDays,
  BookOpen, Image as ImageIcon, Download, Trash2, Plus, 
  ChevronDown, ChevronRight, Edit, Save, CheckCircle2, ShieldAlert, KeyRound, Globe, PhoneCall, Upload
} from 'lucide-react';
import { 
  Page, Programme, Announcement, NewsEvent, 
  StaffProfile, GalleryItem, ResearchPublication, StudentService,
  HomepageSlider, DownloadItem, ContactInfo, CollegeSettings, FooterLink, SocialLink
} from '../types';

interface AdminDashboardProps {
  token: string | null;
  onLoginSuccess: (token: string, user: any) => void;
  onLogout: () => void;
  settings: CollegeSettings;
  contact: ContactInfo;
  onRefetchData: () => void;
}

type AdminSubTab =
  | 'overview'
  | 'aboutVisibility'
  | 'sliders'
  | 'settings'
  | 'footer'
  | 'pages'
  | 'staff'
  | 'gallery'
  | 'programmes'
  | 'downloads'
  | 'research'
  | 'news'
  | 'services'
  | 'announcements';

const adminSubTabs: AdminSubTab[] = [
  'overview',
  'aboutVisibility',
  'sliders',
  'settings',
  'footer',
  'pages',
  'staff',
  'gallery',
  'programmes',
  'downloads',
  'research',
  'news',
  'services',
  'announcements'
];

const aboutVisibilityPages = [
  { slug: 'overview', label: 'Introduction' },
  { slug: 'vision-mission', label: 'Vision, Mission, and Values' },
  { slug: 'staff-profiles', label: 'Staff Profiles' },
  { slug: 'board-of-trustees', label: 'Board of Trustees' }
];

const isSliderVideoMedia = (url = '') => {
  const normalizedUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return url.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|m4v)$/.test(normalizedUrl);
};

const formatUploadSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const getStoredAdminSubTab = (): AdminSubTab => {
  const storedTab = sessionStorage.getItem('clcs_admin_subtab') as AdminSubTab | null;
  return storedTab && adminSubTabs.includes(storedTab) ? storedTab : 'overview';
};

export default function AdminDashboard({
  token,
  onLoginSuccess,
  onLogout,
  settings,
  contact,
  onRefetchData
}: AdminDashboardProps) {
  // Login input state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(getStoredAdminSubTab);
  const [activePageSlug, setActivePageSlug] = useState<string | null>(null);
  const [activePageCategory, setActivePageCategory] = useState<Page['category'] | null>(null);
  const [activeProgrammeSlug, setActiveProgrammeSlug] = useState<string | null>(null);
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(null);
  const [activeDownloadCategory, setActiveDownloadCategory] = useState<DownloadItem['category'] | null>(null);
  const [activeAnnouncementCategory, setActiveAnnouncementCategory] = useState<Announcement['category'] | null>(null);
  const [activeProfileType, setActiveProfileType] = useState<'staff' | 'faculty'>('staff');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Home: true,
    About: false,
    Academics: false,
    Research: false,
    'Student Services': false,
    Announcements: false,
    Footer: false
  });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Loaded database items for quick CMS edits
  const [sliders, setSliders] = useState<HomepageSlider[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [publications, setPublications] = useState<ResearchPublication[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [services, setServices] = useState<StudentService[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const staffProfiles = staff.filter((profile) => (profile.profileType || 'staff') === 'staff');
  const facultyProfiles = staff.filter((profile) => profile.profileType === 'faculty');
  const visibleProfiles = activeProfileType === 'faculty' ? facultyProfiles : staffProfiles;

  // Editing structures
  const [editingSlider, setEditingSlider] = useState<Partial<HomepageSlider> | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingProg, setEditingProg] = useState<Partial<Programme> | null>(null);
  const [editingPublication, setEditingPublication] = useState<Partial<ResearchPublication> | null>(null);
  const [editingNews, setEditingNews] = useState<Partial<NewsEvent> | null>(null);
  const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffProfile> | null>(null);
  const [editingService, setEditingService] = useState<Partial<StudentService> | null>(null);
  const [editingDownload, setEditingDownload] = useState<Partial<DownloadItem> | null>(null);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Campus');

  // Interactive settings state
  const [colNameEn, setColNameEn] = useState(settings.collegeNameEnglish);
  const [colNameDz, setColNameDz] = useState(settings.collegeNameDzongkha);
  const [siteSubtitle, setSiteSubtitle] = useState(settings.siteSubtitle);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [secondaryLogoUrl, setSecondaryLogoUrl] = useState(settings.secondaryLogoUrl || '');
  const [alertTxt, setAlertTxt] = useState(settings.navbarAlert || '');
  const [alertTarget, setAlertTarget] = useState(settings.navbarAlertTarget || 'none');
  const [enrollOpen, setEnrollOpen] = useState(settings.isEnrollmentOpen);
  const [settingsFormDirty, setSettingsFormDirty] = useState(false);
  const [phoneVal, setPhoneVal] = useState(contact.phone);
  const [emailVal, setEmailVal] = useState(contact.email);
  const [addressVal, setAddressVal] = useState(contact.address);
  const [hoursVal, setHoursVal] = useState(contact.workingHours);
  const [mapVal, setMapVal] = useState(contact.mapEmbedUrl);

  // Load Admin Sub-Data upon Login
  useEffect(() => {
    if (token) {
      fetchAdminCMSData();
    }
  }, [token]);

  useEffect(() => {
    sessionStorage.setItem('clcs_admin_subtab', activeSubTab);
  }, [activeSubTab]);

  // Settings arrive asynchronously after admin entry, so keep the form aligned
  // with the persisted server values when the parent refreshes them.
  useEffect(() => {
    if (settingsFormDirty) return;
    setColNameEn(settings.collegeNameEnglish);
    setColNameDz(settings.collegeNameDzongkha);
    setSiteSubtitle(settings.siteSubtitle);
    setLogoUrl(settings.logoUrl || '');
    setSecondaryLogoUrl(settings.secondaryLogoUrl || '');
    setAlertTxt(settings.navbarAlert || '');
    setAlertTarget(settings.navbarAlertTarget || 'none');
    setEnrollOpen(settings.isEnrollmentOpen);
  }, [settings, settingsFormDirty]);

  useEffect(() => {
    if (settingsFormDirty) return;
    setPhoneVal(contact.phone);
    setEmailVal(contact.email);
    setAddressVal(contact.address);
    setHoursVal(contact.workingHours);
    setMapVal(contact.mapEmbedUrl);
  }, [contact, settingsFormDirty]);

  const fetchAdminCMSData = async () => {
    try {
      const rSliders = await fetch('/api/slider');
      setSliders(await rSliders.json());

      const rPages = await fetch('/api/pages');
      setPages(await rPages.json());

      const rProg = await fetch('/api/programmes');
      setProgrammes(await rProg.json());

      const rResearch = await fetch('/api/research');
      setPublications(await rResearch.json());

      const rNews = await fetch('/api/news-events');
      setNewsEvents(await rNews.json());

      const rAnn = await fetch('/api/announcements');
      setAnnouncements(await rAnn.json());

      const rStaff = await fetch('/api/staff');
      setStaff(await rStaff.json());

      const rServices = await fetch('/api/services');
      setServices(await rServices.json());

      const rDown = await fetch('/api/downloads');
      setDownloads(await rDown.json());

      const rGal = await fetch('/api/gallery');
      setGallery(await rGal.json());

      const rNav = await fetch('/api/navigation');
      const navigation = await rNav.json();
      setSocialLinks(navigation.socialLinks || []);
      setFooterLinks(navigation.footerLinks || []);
    } catch (e) {
      console.error("Failed to load backend dynamic datasets", e);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  /**
   * AUTHENTICATION HANDLERS
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.token, data.user);
        setUsername('');
        setPassword('');
        showNotification("Tashi Delek! Welcome back to Trongsa College administrative zone.");
      } else {
        setLoginError(data.error || 'Invalid credentials provided. Please check again.');
      }
    } catch (err) {
      setLoginError('Server authentication check failed. Is server online?');
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordSuccess('Security credentials updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordError(data.error || 'Password update failed.');
      }
    } catch (err) {
      setPasswordError('Network failed updating credentials.');
    }
  };

  /**
   * SLIDER BANNER MUTATION
   */
  const handleSaveSlider = async () => {
    if (!editingSlider?.title || !editingSlider?.imageUrl) {
      alert("Please define both slider layout Header Title and Slide Visual.");
      return;
    }
    try {
      const res = await fetch('/api/slider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingSlider)
      });
      if (res.ok) {
        showNotification("Homepage Slider banner processed successfully!");
        setEditingSlider(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {
      alert("Error saving banner");
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("Are you sure you want to permanently remove this landing slide?")) return;
    try {
      await fetch(`/api/slider/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Slider removed successfully.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * MARKDOWN PAGE CONTENT SAVING
   */
  const handleSavePage = async () => {
    if (!editingPage) return;
    if (!editingPage.title || !editingPage.slug) {
      alert("Page title and slug are required.");
      return;
    }
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPage)
      });
      if (res.ok) {
        showNotification(`Page content for [${editingPage.title}] successfully pushed to production!`);
        setEditingPage(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleToggleAboutPage = async (slug: string, enabled: boolean) => {
    const page = pages.find((entry) => entry.slug === slug);
    if (!page) {
      alert("This About page record is not available yet.");
      return;
    }

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...page, enabled })
      });

      if (res.ok) {
        showNotification(`${page.title} is now ${enabled ? 'enabled' : 'disabled'} on the About page.`);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  /**
   * PROGRAMME SAVING
   */
  const handleSaveProgramme = async () => {
    if (!editingProg?.title || !editingProg?.description) {
      alert("Title and descriptions are required.");
      return;
    }
    try {
      const res = await fetch('/api/programmes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProg)
      });
      if (res.ok) {
        showNotification("Academic Programme stored.");
        setEditingProg(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteProgramme = async (id: string) => {
    if (!confirm("Remove this degree course catalog list completely?")) return;
    try {
      await fetch(`/api/programmes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Programme removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * RESEARCH PUBLICATIONS SAVING
   */
  const handleSavePublication = async () => {
    if (!editingPublication?.title || !editingPublication?.author) {
      alert("Publication title and author are required.");
      return;
    }
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPublication)
      });
      if (res.ok) {
        showNotification("Research publication updated.");
        setEditingPublication(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeletePublication = async (id: string) => {
    if (!confirm("Delete this research publication?")) return;
    try {
      await fetch(`/api/research/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Research publication removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * RESEARCH NEWS SAVING
   */
  const handleSaveNews = async () => {
    if (!editingNews?.title || !editingNews?.description) {
      alert("News title and description are required.");
      return;
    }
    try {
      const res = await fetch('/api/news-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingNews)
      });
      if (res.ok) {
        showNotification("Research news item updated.");
        setEditingNews(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Delete this research news item?")) return;
    try {
      await fetch(`/api/news-events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Research news item removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * ANNOUNCEMENTS / NOTICES SAVING
   */
  const handleSaveAnnouncement = async () => {
    if (!editingAnn?.title || !editingAnn?.category) {
      alert("Title and target category are necessary.");
      return;
    }
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingAnn)
      });
      if (res.ok) {
        showNotification("Notice board post successfully dispatched!");
        setEditingAnn(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this notice block?")) return;
    try {
      await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Announcement removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * STAFF PROFILES SAVING
   */
  const handleSaveStaff = async () => {
    if (!editingStaff?.name || !editingStaff?.designation) {
      alert("Name and Designation must be set.");
      return;
    }
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingStaff)
      });
      if (res.ok) {
        showNotification(`${editingStaff.profileType === 'faculty' ? 'Faculty' : 'Staff'} profile updated.`);
        setEditingStaff(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff profile?")) return;
    try {
      await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Staff member deleted.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * STUDENT SERVICES SAVING
   */
  const handleSaveService = async () => {
    if (!editingService?.title || !editingService?.description) {
      alert("Service title and description are required.");
      return;
    }
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingService)
      });
      if (res.ok) {
        showNotification("Student service updated.");
        setEditingService(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Delete this student service?")) return;
    try {
      await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Student service removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * DOWNLOAD ITEM SAVING
   */
  const handleSaveDownload = async () => {
    if (!editingDownload?.title || !editingDownload?.category) {
      alert("Please specify file title and target folder category.");
      return;
    }
    const downloadToSave: Partial<DownloadItem> = {
      ...editingDownload,
      category: activeDownloadCategory || editingDownload.category
    };
    if (editingDownload.category === 'academic-calendar' && !editingDownload.calendarDate) {
      alert("Please specify the calendar start date.");
      return;
    }
    if (downloadToSave.category !== 'academic-calendar' && (!editingDownload.fileUrl || editingDownload.fileUrl === '#')) {
      alert("Please upload a document for this item.");
      return;
    }
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(downloadToSave)
      });
      if (res.ok) {
        showNotification("Download registry updated successfully.");
        setEditingDownload(null);
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteDownload = async (id: string) => {
    if (!confirm("Delete this doc catalog index?")) return;
    try {
      await fetch(`/api/downloads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("File download item deleted.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * GALLERY SAVING
   */
  const handleSaveGallery = async () => {
    if (!newGalleryTitle || !newGalleryUrl) {
      alert("Please provide a Title and authentic image URL.");
      return;
    }
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newGalleryTitle,
          imageUrl: newGalleryUrl,
          category: newGalleryCategory
        })
      });
      if (res.ok) {
        showNotification("New visual memory uploaded successfully.");
        setNewGalleryTitle('');
        setNewGalleryUrl('');
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Delete this gallery piece?")) return;
    try {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Image deleted from catalog.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  /**
   * GLOBAL CONTACT & ENROLLMENT SETTINGS SAVING
   */
  const handleSaveGlobalSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: {
            collegeNameEnglish: colNameEn.trim(),
            collegeNameDzongkha: colNameDz.trim(),
            siteSubtitle: siteSubtitle.trim(),
            logoUrl,
            secondaryLogoUrl,
            navbarAlert: alertTxt.trim(),
            navbarAlertTarget: alertTarget,
            isEnrollmentOpen: enrollOpen
          },
          contactInfo: {
            collegeName: colNameEn.trim(),
            phone: phoneVal.trim(),
            email: emailVal.trim(),
            address: addressVal.trim(),
            workingHours: hoursVal.trim(),
            mapEmbedUrl: mapVal.trim()
          }
        })
      });
      if (res.ok) {
        setSettingsFormDirty(false);
        showNotification("Institutional and configuration settings pushed to cloud registry.");
        onRefetchData();
      }
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'primary' | 'secondary' = 'primary') => {
    setSettingsFormDirty(true);
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Select an image file for the header logo.");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("Logo image must be 1 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'secondary') {
          setSecondaryLogoUrl(reader.result);
        } else {
          setLogoUrl(reader.result);
        }
      }
    };
    reader.onerror = () => alert("Logo image could not be read.");
    reader.readAsDataURL(file);
  };

  const handleSliderMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingSlider) return;

    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name);
    if (!isImage && !isVideo) {
      alert("Select an image or video file for the slide visual.");
      return;
    }

    const maxSize = isVideo ? 5 * 1024 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Slide ${isVideo ? 'video' : 'image'} must be ${isVideo ? '5 GB' : '50 MB'} or smaller.`);
      return;
    }

    try {
      const response = await fetch('/api/uploads/slider-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          'X-Filename': encodeURIComponent(file.name)
        },
        body: file
      });
      const responseText = await response.text();
      let result: { error?: string; mediaType?: 'image' | 'video'; url?: string } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = { error: responseText || `Upload failed with status ${response.status}. Restart the dev server if this route was just added.` };
      }
      if (!response.ok || !result.url) {
        alert(result.error || "Slide media upload failed.");
        return;
      }

      setEditingSlider((currentSlide) => currentSlide
        ? {
            ...currentSlide,
            imageUrl: result.url,
            videoUrl: result.mediaType === 'video' ? result.url : undefined
          }
        : currentSlide);
      showNotification(`${isVideo ? 'Video' : 'Image'} uploaded for this slide.`);
    } catch (error) {
      alert("Slide media upload failed.");
    }
  };

  const handleDownloadDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingDownload) return;

    const supportedDocument = /\.(pdf|docx?|xlsx?|pptx?|txt|csv)$/i.test(file.name);
    if (!supportedDocument) {
      alert("Select a PDF, Word, Excel, PowerPoint, TXT, or CSV document.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert("Document must be 100 MB or smaller.");
      return;
    }

    try {
      const response = await fetch('/api/uploads/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type || 'application/octet-stream',
          'X-Filename': encodeURIComponent(file.name)
        },
        body: file
      });
      const responseText = await response.text();
      let result: { error?: string; url?: string; size?: number } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = { error: responseText || `Upload failed with status ${response.status}. Restart the dev server if this route was just added.` };
      }
      if (!response.ok || !result.url) {
        alert(result.error || "Document upload failed.");
        return;
      }

      setEditingDownload((currentDownload) => currentDownload
        ? {
            ...currentDownload,
            fileUrl: result.url,
            fileSize: typeof result.size === 'number' ? formatUploadSize(result.size) : currentDownload.fileSize
          }
        : currentDownload);
      showNotification("Document uploaded and linked to this download item.");
    } catch (error) {
      alert("Document upload failed.");
    }
  };

  const handleStaffAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingStaff) return;
    if (!file.type.startsWith('image/')) {
      alert("Select an image file for the staff avatar.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Staff avatar image must be 10 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingStaff((currentStaff) => currentStaff ? { ...currentStaff, image: reader.result as string } : currentStaff);
      }
    };
    reader.onerror = () => alert("Staff avatar image could not be read.");
    reader.readAsDataURL(file);
  };

  const handleProgrammeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingProg) return;
    if (!file.type.startsWith('image/')) {
      alert("Select an image file for the programme cover.");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("Programme cover image must be 1 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingProg((currentProgramme) => currentProgramme ? { ...currentProgramme, image: reader.result as string } : currentProgramme);
      }
    };
    reader.onerror = () => alert("Programme cover image could not be read.");
    reader.readAsDataURL(file);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Remove this page from the client site?")) return;
    try {
      await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showNotification("Page removed.");
      fetchAdminCMSData();
      onRefetchData();
    } catch (e) {}
  };

  const handleSaveSocialLinks = async () => {
    try {
      const res = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ socialLinks })
      });
      if (res.ok) {
        showNotification("Social links updated.");
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };

  const handleSaveFooterLinks = async () => {
    try {
      const res = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ footerLinks })
      });
      if (res.ok) {
        showNotification("Footer links updated.");
        fetchAdminCMSData();
        onRefetchData();
      }
    } catch (e) {}
  };


  // RETURN LOGIN FORM IF NOT AUTHENTICATED
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-[#0b2341] text-white p-6 text-center border-b border-[#b68a2a]/35">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#b68a2a]/35">
            <Lock className="w-6 h-6 text-[#b68a2a]" />
          </div>
          <h3 className="font-display font-extrabold text-lg tracking-wide uppercase">CLCS Admin Console</h3>
          <p className="text-slate-300 text-xs italic">Trongsa College of Heritage and Contemporary Studies</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {loginError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-200">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Account Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin" 
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-[#0b2341]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">System Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:outline-none focus:border-[#0b2341]"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0b2341] hover:bg-[#7a1f2b] text-white font-bold py-2 px-4 rounded text-xs tracking-widest uppercase transition-colors pointer cursor-pointer"
          >
            Authenticate Portal
          </button>
        </form>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[10px] text-center text-slate-400 font-mono">
          <span>Security Key is managed in private .env storage files securely.</span>
        </div>
      </div>
    );
  }

  // RENDER COMPLETE ADMIN CMS AREA CONTAINER
  return (
    <div className="max-w-7xl mx-auto my-4 sm:my-6 px-3 sm:px-4">
      {/* Alert Banner for success actions */}
      {successMsg && (
        <div className="fixed top-24 right-6 bg-[#0b2341] text-white py-3 px-6 rounded-xl shadow-2xl flex items-center gap-3 z-50 border border-[#b68a2a] animate-fade-in text-xs">
          <CheckCircle2 className="w-5 h-5 text-[#b68a2a]" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Top Banner layout */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="bg-[#b68a2a] text-xs font-bold text-[#0b2341] px-2 py-0.5 rounded uppercase tracking-wider">
            Consolidated Management Console
          </span>
          <h2 className="text-[#0b2341] font-display font-extrabold text-2xl tracking-normal mt-1 leading-none">
            Welcome, Academic Portal Coordinator
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Publish course syllabi, broadcast dynamic tender notifications, track user admissions tags, and archive journal publications safely.
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-800 text-white font-bold hover:bg-slate-800 text-xs py-2 px-4 rounded cursor-pointer transition"
        >
          Close Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Drawer Navigator */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit space-y-1">
          <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">Section Editors</h3>
          {[
            {
              label: 'Home',
              items: [
                { id: 'overview', label: 'Dashboard', icon: Landmark },
                { id: 'sliders', label: 'Carousel Slides', icon: Layers },
                { id: 'settings', label: 'Header & Contact Settings', icon: Settings }
              ]
            },
            {
              label: 'About',
              items: [
                { id: 'aboutVisibility', label: 'Enable / Disable Sections', icon: Settings },
                { id: 'pages', label: 'Introduction', icon: BookOpen, pageSlug: 'overview' },
                { id: 'pages', label: 'Vision, Mission, and Values', icon: BookOpen, pageSlug: 'vision-mission' },
                { id: 'staff', label: 'Staff Profiles', icon: Users, profileType: 'staff' },
                { id: 'pages', label: 'Board of Trustees', icon: BookOpen, pageSlug: 'board-of-trustees' },
                { id: 'gallery', label: 'Gallery', icon: ImageIcon }
              ]
            },
            {
              label: 'Academics',
              items: [
                { heading: 'Admissions' },
                { id: 'pages', label: 'Admission Information', icon: BookOpen, pageSlug: 'admission-information' },
                { id: 'pages', label: 'Application Process', icon: BookOpen, pageSlug: 'application-process' },
                { id: 'pages', label: 'Selection Criteria', icon: BookOpen, pageSlug: 'selection-criteria' },
                { id: 'pages', label: 'Admission Confirmation', icon: BookOpen, pageSlug: 'admission-confirmation' },
                { heading: 'Programs' },
                { id: 'programmes', label: 'Bachelor of Arts in Language and Heritage Studies', icon: Landmark, programmeSlug: 'ba-language-heritage-studies' },
                { id: 'programmes', label: 'Bachelor of Arts in Bhutan Studies and Global Perspectives', icon: Landmark, programmeSlug: 'ba-bhutan-studies-global-perspectives' },
                { id: 'programmes', label: 'Bachelor of Arts in Cultural Innovation and Entrepreneurship', icon: Landmark, programmeSlug: 'ba-cultural-innovation-entrepreneurship' },
                { id: 'programmes', label: 'Bachelor of Arts in History and Global Affairs', icon: Landmark, programmeSlug: 'ba-history-global-affairs' },
                { id: 'programmes', label: 'Bachelor of Arts in Psychology and Mindfulness Studies', icon: Landmark, programmeSlug: 'ba-psychology-mindfulness' },
                { id: 'downloads', label: 'Academic Calendar', icon: Download, downloadCategory: 'academic-calendar' },
                { id: 'staff', label: 'Faculty Profiles', icon: Users, profileType: 'faculty' },
                { heading: 'Library' },
                { id: 'pages', label: 'Koha Library', icon: BookOpen, pageSlug: 'koha-library' },
                { id: 'pages', label: 'e-Library', icon: BookOpen, pageSlug: 'e-library' },
                { id: 'pages', label: 'Examination Office', icon: BookOpen, pageSlug: 'examination-office' },
                { id: 'pages', label: 'Academic Guidelines', icon: BookOpen, pageSlug: 'academic-guidelines' },
                { id: 'pages', label: 'International Programs', icon: BookOpen, pageSlug: 'international-programs' },
                { id: 'pages', label: 'Convocation Registration', icon: BookOpen, pageSlug: 'convocation-registration' }
              ]
            },
            {
              label: 'Research',
              items: [
                { id: 'pages', label: 'Rigzoed Journal', icon: BookOpen, pageSlug: 'rigzoed-journal' },
                { id: 'research', label: 'Publications', icon: BookOpen },
                { id: 'pages', label: 'Research Centres', icon: BookOpen, pageSlug: 'research-centres' },
                { heading: 'Research Centres' },
                { id: 'pages', label: 'Research Centre for Buddhist Studies', icon: BookOpen, pageSlug: 'research-centre-buddhist-studies' },
                { id: 'pages', label: 'Bhutan & Himalayan Research Centre', icon: BookOpen, pageSlug: 'bhutan-himalayan-research-centre' },
                { id: 'news', label: 'Research News & Events', icon: Megaphone },
                { id: 'pages', label: 'Bhutan Culture Atlas', icon: BookOpen, pageSlug: 'bhutan-culture-atlas' },
                { id: 'pages', label: 'Research Policies & Guidelines', icon: BookOpen, pageSlug: 'research-policies-guidelines' },
                { id: 'downloads', label: 'Research Forms', icon: Download, downloadCategory: 'research-forms' }
              ]
            },
            {
              label: 'Student Services',
              items: [
                { id: 'services', label: 'Campus Life', icon: Users, serviceSlug: 'campus-life' },
                { id: 'services', label: 'IT Lab', icon: Users, serviceSlug: 'it-lab' },
                { id: 'services', label: 'Language Centre', icon: Users, serviceSlug: 'language-centre' },
                { id: 'services', label: 'Culture', icon: Users, serviceSlug: 'culture' },
                { id: 'services', label: 'Sports & Games', icon: Users, serviceSlug: 'sports-and-games' },
                { id: 'services', label: 'Mess', icon: Users, serviceSlug: 'mess' },
                { id: 'services', label: 'Student Clubs', icon: Users, serviceSlug: 'student-clubs' },
                { heading: 'Student Clubs' },
                { id: 'services', label: 'Dzongkha Literature', icon: Users, serviceSlug: 'dzongkha-literature' },
                { id: 'services', label: 'Media Club', icon: Users, serviceSlug: 'media-club' },
                { id: 'services', label: 'Clean Bhutan', icon: Users, serviceSlug: 'clean-bhutan' },
                { id: 'services', label: 'Karate / Taekwondo', icon: Users, serviceSlug: 'karate-taekwondo' },
                { id: 'services', label: 'Rovers', icon: Users, serviceSlug: 'rovers' },
                { id: 'services', label: 'Student Associations', icon: Users, serviceSlug: 'student-associations' },
                { id: 'services', label: 'Student Centre', icon: Users, serviceSlug: 'student-centre' },
                { id: 'services', label: 'Counseling Services', icon: Users, serviceSlug: 'counseling-services' },
                { id: 'services', label: 'Accommodation', icon: Users, serviceSlug: 'accommodation' },
                { id: 'services', label: 'Student Parliament', icon: Users, serviceSlug: 'student-parliament' },
                { id: 'services', label: 'Student Handbook', icon: Users, serviceSlug: 'student-handbook' },
                { id: 'services', label: 'Discipline', icon: Users, serviceSlug: 'discipline' }
              ]
            },
            {
              label: 'Announcements',
              items: [
                { id: 'announcements', label: 'Announcements', icon: Megaphone, announcementCategory: 'Announcements' },
                { id: 'announcements', label: 'Job Vacancies', icon: Megaphone, announcementCategory: 'Job Vacancies' },
                { id: 'announcements', label: 'Tenders', icon: Megaphone, announcementCategory: 'Tenders' },
                { id: 'announcements', label: 'News & Events', icon: Megaphone, announcementCategory: 'News and Events' },
                { heading: 'Custom Pages' },
                { id: 'pages', label: 'Announcement Pages', icon: BookOpen, pageCategory: 'announcements' }
              ]
            },
            {
              label: 'Footer',
              items: [
                { id: 'footer', label: 'Footer Links', icon: Layers }
              ]
            }
          ].map((group) => (
            <div key={group.label} className="pt-2 first:pt-0">
              <button
                type="button"
                onClick={() => setExpandedSections((sections) => ({ ...sections, [group.label]: !sections[group.label] }))}
                aria-expanded={!!expandedSections[group.label]}
                className="w-full rounded px-3 py-2 flex items-center justify-between gap-2 text-left text-xs font-extrabold text-slate-600 hover:bg-slate-100 hover:text-[#0b2341] cursor-pointer"
              >
                <span>{group.label}</span>
                {expandedSections[group.label] ? (
                  <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                )}
              </button>
              {expandedSections[group.label] && (
                <div className="pl-2 pt-1 border-l border-slate-100 ml-3 space-y-0.5">
                  {group.items.map((itm) => 'heading' in itm ? (
                    <p key={itm.heading} className="px-6 pt-2 pb-1 text-[9px] font-bold uppercase text-slate-400">{itm.heading}</p>
                  ) : (
                    <button
                      key={`${itm.id}-${itm.label}`}
                      onClick={() => {
                        setActiveSubTab(itm.id as AdminSubTab);
                        setActivePageSlug('pageSlug' in itm ? itm.pageSlug ?? null : null);
                        setActivePageCategory('pageCategory' in itm ? itm.pageCategory as Page['category'] : null);
                        setActiveProgrammeSlug('programmeSlug' in itm ? itm.programmeSlug ?? null : null);
                        setActiveServiceSlug('serviceSlug' in itm ? itm.serviceSlug ?? null : null);
                        setActiveDownloadCategory('downloadCategory' in itm ? itm.downloadCategory as DownloadItem['category'] : null);
                        setActiveAnnouncementCategory('announcementCategory' in itm ? itm.announcementCategory as Announcement['category'] : null);
                        setActiveProfileType('profileType' in itm ? itm.profileType as 'staff' | 'faculty' : 'staff');
                        setEditingSlider(null);
                        setEditingPage(null);
                        setEditingProg(null);
                        setEditingPublication(null);
                        setEditingNews(null);
                        setEditingAnn(null);
                        setEditingStaff(null);
                        setEditingService(null);
                        setEditingDownload(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                        activeSubTab === itm.id
                          && (!('pageSlug' in itm) || activePageSlug === itm.pageSlug)
                          && (!('pageCategory' in itm) || activePageCategory === itm.pageCategory)
                          && (!('programmeSlug' in itm) || activeProgrammeSlug === itm.programmeSlug)
                          && (!('serviceSlug' in itm) || activeServiceSlug === itm.serviceSlug)
                          && (!('downloadCategory' in itm) || activeDownloadCategory === itm.downloadCategory)
                          && (!('announcementCategory' in itm) || activeAnnouncementCategory === itm.announcementCategory)
                          && (!('profileType' in itm) || activeProfileType === itm.profileType)
                          ? 'bg-[#0b2341] text-white' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#0b2341]'
                      }`}
                    >
                      <itm.icon className={`w-4 h-4 ${
                        activeSubTab === itm.id
                          && (!('pageSlug' in itm) || activePageSlug === itm.pageSlug)
                          && (!('pageCategory' in itm) || activePageCategory === itm.pageCategory)
                          && (!('programmeSlug' in itm) || activeProgrammeSlug === itm.programmeSlug)
                          && (!('serviceSlug' in itm) || activeServiceSlug === itm.serviceSlug)
                          && (!('downloadCategory' in itm) || activeDownloadCategory === itm.downloadCategory)
                          && (!('announcementCategory' in itm) || activeAnnouncementCategory === itm.announcementCategory)
                          && (!('profileType' in itm) || activeProfileType === itm.profileType)
                          ? 'text-[#b68a2a]' : 'text-slate-400'
                      }`} />
                      <span>{itm.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Dynamic CMS Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm min-h-[400px] min-w-0">

          {/* TAB: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-[#0b2341] font-display font-extrabold text-lg">System Dashboard Overview</h4>
                <p className="text-xs text-gray-500">Fast visual status logs of database registries.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-xl font-bold text-[#0b2341]">{pages.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Dynamic Pages</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-xl font-bold text-[#0b2341]">{programmes.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Syllabi Degrees</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-xl font-bold text-[#0b2341]">{announcements.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Notices Dispatched</div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-xl font-bold text-[#0b2341]">{staffProfiles.length}/{facultyProfiles.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Staff / Faculty</div>
                </div>
              </div>

              {/* Safety notice info */}
              <div className="p-4 bg-[#0b2341]/5 rounded-lg border border-[#0b2341]/10 flex gap-3 text-xs text-slate-700 leading-relaxed max-w-2xl">
                <ShieldAlert className="w-5 h-5 text-[#b68a2a] flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#0b2341]">Role and Session Management Policy</p>
                  <p className="mt-1">
                    Authentications are stored in system security headers. To maintain the server-side integrity, do not execute script operations in public internet lounges. Any edits completed here propagate instantaneously to the public client homepage view.
                  </p>
                </div>
              </div>

              {/* Change credentials */}
              <form onSubmit={handlePasswordChangeSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 max-w-md space-y-3">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <KeyRound className="w-4 h-4 text-clcs-maroon" /> Change Passwords
                </h5>
                {passwordError && <div className="text-xs text-red-700">{passwordError}</div>}
                {passwordSuccess && <div className="text-xs text-clcs-navy">{passwordSuccess}</div>}
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs border bg-white border-slate-300 rounded px-2.5 py-1.5 focus:outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs border bg-white border-slate-300 rounded px-2.5 py-1.5 focus:outline-none" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-[#0b2341] hover:bg-[#7a1f2b] text-white hover:text-white px-3 py-1.5 font-bold rounded text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Update Credentials
                </button>
              </form>
            </div>
          )}

          {/* TAB: ABOUT SECTION VISIBILITY */}
          {activeSubTab === 'aboutVisibility' && (
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h4 className="text-[#0b2341] font-display font-extrabold text-lg">About Section Visibility</h4>
                <p className="text-xs text-gray-500">Enable or disable About page tabs shown on the public website.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aboutVisibilityPages.map((item) => {
                  const page = pages.find((entry) => entry.slug === item.slug);
                  const enabled = page?.enabled !== false;

                  return (
                    <div key={item.slug} className="rounded-lg border border-slate-200 bg-slate-50/40 p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h5 className="text-xs font-extrabold text-slate-800">{item.label}</h5>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {page ? `Slug: ${page.slug}` : 'Page record missing'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!page}
                        onClick={() => handleToggleAboutPage(item.slug, !enabled)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition ${
                          enabled
                            ? 'bg-[#0b2341] text-white hover:bg-clcs-maroon'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        } ${!page ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: HERO CAROUSEL */}
          {activeSubTab === 'sliders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Homepage Slider Banners</h4>
                  <p className="text-xs text-gray-500">Edit dynamic overlay headlines and visual backgrounds.</p>
                </div>
                {!editingSlider && (
                  <button 
                    onClick={() => setEditingSlider({ title: '', subtitle: '', imageUrl: '', ctaEnabled: true, virtualTourEnabled: true, ctaText: 'Explore', ctaLink: '/' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Slide
                  </button>
                )}
              </div>

              {editingSlider && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">{editingSlider.id ? 'Edit Slide Details' : 'Create New Slide'}</h5>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700">Slide Heading Title *</label>
                      <input 
                        type="text" 
                        value={editingSlider.title || ''} 
                        onChange={(e) => setEditingSlider({...editingSlider, title: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white"
                        placeholder="e.g. Traditional Wisdom Meets Design"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Description / Subtitle</label>
                      <textarea 
                        value={editingSlider.subtitle || ''} 
                        onChange={(e) => setEditingSlider({...editingSlider, subtitle: e.target.value})}
                        className="w-full border rounded p-2 mt-1 h-20 bg-white"
                        placeholder="Give a brief summary text of the banner segment"
                      />
                    </div>
                    <div className="rounded border bg-white p-3">
                      <label className="block font-semibold text-slate-700">Slide Visual *</label>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded bg-[#0b2341] px-3 py-2 text-[11px] font-bold text-white hover:bg-clcs-maroon">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSliderMediaUpload}
                            className="hidden"
                          />
                        </label>
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded bg-[#7a1f2b] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#0b2341]">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleSliderMediaUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">Images up to 50 MB. Videos up to 5 GB.</span>
                      </div>
                      {editingSlider.imageUrl && (
                        <p className="mt-2 text-[10px] font-semibold text-[#0b2341]">Visual selected.</p>
                      )}
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded border bg-white p-3">
                      <span>
                        <span className="block font-semibold text-slate-700">Show CTA Button</span>
                        <span className="block text-[10px] text-slate-400">Enable the banner button text and link on this slide.</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={editingSlider.ctaEnabled !== false}
                        onChange={(e) => setEditingSlider({ ...editingSlider, ctaEnabled: e.target.checked })}
                        className="h-4 w-4 accent-[#0b2341]"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded border bg-white p-3">
                      <span>
                        <span className="block font-semibold text-slate-700">Show Virtual Tour Button</span>
                        <span className="block text-[10px] text-slate-400">Enable the Virtual Tour button on this slide.</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={editingSlider.virtualTourEnabled !== false}
                        onChange={(e) => setEditingSlider({ ...editingSlider, virtualTourEnabled: e.target.checked })}
                        className="h-4 w-4 accent-[#0b2341]"
                      />
                    </label>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${editingSlider.ctaEnabled === false ? 'opacity-50' : ''}`}>
                      <div>
                        <label className="block font-semibold text-slate-700">CTA Button Text</label>
                        <input 
                          type="text" 
                          value={editingSlider.ctaText || ''} 
                          onChange={(e) => setEditingSlider({...editingSlider, ctaText: e.target.value})}
                          disabled={editingSlider.ctaEnabled === false}
                          className="w-full border rounded p-2 mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">CTA Button Link</label>
                        <input 
                          type="text" 
                          value={editingSlider.ctaLink || ''} 
                          onChange={(e) => setEditingSlider({...editingSlider, ctaLink: e.target.value})}
                          disabled={editingSlider.ctaEnabled === false}
                          className="w-full border rounded p-2 mt-1 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveSlider} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">
                      Save Banner Changes
                    </button>
                    <button onClick={() => setEditingSlider(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sliders.map(s => (
                  <div key={s.id} className="border border-slate-100 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div className="flex gap-3 items-center">
                      {isSliderVideoMedia(s.videoUrl || s.imageUrl) ? (
                        <video src={s.videoUrl || s.imageUrl} className="w-16 h-12 object-cover rounded bg-slate-200 flex-shrink-0" muted preload="metadata" />
                      ) : (
                        <img src={s.imageUrl} className="w-16 h-12 object-cover rounded bg-slate-200 flex-shrink-0" alt="slide thumb" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      )}
                      <div>
                        <h6 className="font-bold text-xs text-slate-800">{s.title}</h6>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{s.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingSlider(s)} className="text-clcs-navy p-1.5 hover:bg-white rounded border border-slate-200">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteSlider(s.id)} className="text-red-700 p-1.5 hover:bg-white rounded border border-slate-200">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STATIC CHANNELS */}
          {activeSubTab === 'pages' && (
            <div className="space-y-6">
              <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Page Content</h4>
                  <p className="text-xs text-gray-500">
                    {activePageCategory === 'announcements'
                      ? 'Create and edit fully custom client pages for the Announcements section.'
                      : 'Edit the selected submenu page. Profile, program, calendar, and gallery records use their dedicated editors.'}
                  </p>
                </div>
                {activePageCategory === 'announcements' && !editingPage && (
                  <button
                    onClick={() => setEditingPage({ id: '', slug: '', title: '', category: 'announcements', content: '', lastUpdated: '' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Create Page
                  </button>
                )}
              </div>

              {editingPage ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Editing: {editingPage.title} ({editingPage.slug})</span>
                    <button onClick={() => setEditingPage(null)} className="text-xs bg-slate-300 px-2 py-1 rounded">Go back</button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Page Headline Title *</label>
                    <input 
                      type="text" 
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full border rounded text-xs p-2 bg-white" 
                    />
                  </div>

                  {editingPage.category === 'announcements' && !editingPage.id && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Page Slug *</label>
                      <input
                        type="text"
                        value={editingPage.slug}
                        onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '') })}
                        placeholder="e.g. annual-college-festival"
                        className="w-full border rounded text-xs p-2 bg-white font-mono"
                      />
                    </div>
                  )}

                  {editingPage.category === 'academics' && ['koha-library', 'e-library'].includes(editingPage.slug) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Library Link URL</label>
                      <input
                        type="url"
                        value={editingPage.externalUrl || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, externalUrl: e.target.value })}
                        placeholder="https://library.example.bt"
                        className="w-full border rounded text-xs p-2 bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">When this is set, the client Library menu opens this link instead of the page content.</p>
                    </div>
                  )}

                  {editingPage.category === 'research' && ['rigzoed-journal', 'bhutan-culture-atlas'].includes(editingPage.slug) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">External Website URL</label>
                      <input
                        type="url"
                        value={editingPage.externalUrl || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, externalUrl: e.target.value })}
                        placeholder={editingPage.slug === 'rigzoed-journal' ? 'https://www.clcs.edu.bt/rigzoed-journal-2/' : 'http://www.bhutanculturalatlas.clcs.edu.bt'}
                        className="w-full border rounded text-xs p-2 bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">When this is set, the Research menu opens this website in a new tab.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Body Content Markdown Editor (Supports safe markdown headers, lists, italics, blockquotes)
                    </label>
                    <textarea 
                      value={editingPage.content}
                      onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                      className="w-full border rounded text-xs font-mono p-3 h-80 bg-white" 
                    />
                  </div>

                  <button 
                    onClick={handleSavePage}
                    className="bg-[#0b2341] text-white hover:bg-clcs-maroon font-bold text-xs py-2 px-4 rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Page Content
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pages.filter((page) => (!activePageSlug || page.slug === activePageSlug) && (!activePageCategory || page.category === activePageCategory)).map(p => (
                    <div key={p.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/20 hover:border-[#b68a2a] transition flex flex-col justify-between">
                      <div>
                        <span className="bg-[#0b2341]/10 text-[#0b2341] text-[9px] px-2 py-0.5 rounded uppercase font-bold">{p.category}</span>
                        <h5 className="font-bold text-xs text-slate-800 mt-2">{p.title}</h5>
                        <p className="text-[10px] text-gray-400 mt-1">Slug: {p.slug} • Updated: {p.lastUpdated}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingPage(p)}
                          className="text-[#0b2341] text-xs font-bold hover:text-clcs-gold flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit Document Content
                        </button>
                        {p.category === 'announcements' && (
                          <button
                            onClick={() => handleDeletePage(p.id)}
                            className="text-red-700 text-xs font-bold hover:bg-red-50 rounded px-1 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {activePageSlug && !pages.some((page) => page.slug === activePageSlug) && (
                    <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-500">
                      This About page record is not available yet.
                    </div>
                  )}
                  {activePageCategory === 'announcements' && !pages.some((page) => page.category === 'announcements') && (
                    <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-500">
                      No custom announcement pages exist yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: ACADEMIC LIST */}
          {activeSubTab === 'programmes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Academic Selection Catalogue</h4>
                  <p className="text-xs text-gray-500">Manage programme cards, detail-page content, cover images, eligibility, and syllabus links.</p>
                </div>
                {!editingProg && (
                  <button 
                    onClick={() => setEditingProg({ title: '', description: '', eligibility: '', duration: '4 Years (Full-Time)', level: 'Undergraduate', downloadUrl: '#', image: '' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Degree
                  </button>
                )}
              </div>

              {editingProg && (
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-5 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#7a1f2b] tracking-wide">
                        <Landmark className="w-3.5 h-3.5" />
                        {editingProg.id ? 'Edit Degree Details' : 'Create New Degree Offering'}
                      </span>
                      <h5 className="font-display font-extrabold text-[#0b2341] text-lg mt-1">Programme Card & Detail Page</h5>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Course / Programme Title *</label>
                        <input 
                          type="text" 
                          value={editingProg.title || ''} 
                          onChange={(e) => setEditingProg({...editingProg, title: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Card & Page Description *</label>
                        <textarea 
                          value={editingProg.description || ''} 
                          onChange={(e) => setEditingProg({...editingProg, description: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 h-28 bg-white text-xs leading-5"
                          placeholder="Short programme summary shown on the public programme card and detail page."
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Eligibility Criteria Requirements</label>
                        <textarea 
                          value={editingProg.eligibility || ''} 
                          onChange={(e) => setEditingProg({...editingProg, eligibility: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 h-24 bg-white text-xs leading-5"
                          placeholder="e.g. Class XII passed with 50% aggregate minimum."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Duration Period</label>
                        <input 
                          type="text" 
                          value={editingProg.duration || ''} 
                          onChange={(e) => setEditingProg({...editingProg, duration: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Level</label>
                        <select 
                          value={editingProg.level || 'Undergraduate'}
                          onChange={(e) => setEditingProg({...editingProg, level: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 bg-white text-xs"
                        >
                          <option value="Undergraduate">Undergraduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Syllabus / PDF Link</label>
                        <input 
                          type="text" 
                          value={editingProg.downloadUrl || ''} 
                          onChange={(e) => setEditingProg({...editingProg, downloadUrl: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div>
                        <label className="block font-semibold text-slate-700">Cover Display Photograph URL</label>
                        <input 
                          type="text" 
                          value={editingProg.image || ''} 
                          onChange={(e) => setEditingProg({...editingProg, image: e.target.value})}
                          className="w-full border rounded-lg p-2.5 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                      <label className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0b2341]/20 bg-white px-3 py-2.5 text-xs font-bold text-[#0b2341] cursor-pointer hover:border-[#b68a2a]">
                        <ImageIcon className="w-4 h-4" />
                        Upload cover
                        <input type="file" accept="image/*" onChange={handleProgrammeImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveProgramme} className="bg-[#0b2341] text-white text-xs py-2.5 px-4 font-bold rounded-lg cursor-pointer hover:bg-[#7a1f2b]">
                        Save Programme
                      </button>
                      <button onClick={() => setEditingProg(null)} className="bg-white border text-slate-700 text-xs py-2.5 px-3 rounded-lg cursor-pointer hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <aside className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="h-40 bg-[#0b2341] relative overflow-hidden">
                      {editingProg.image ? (
                        <img src={editingProg.image} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/70">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b2341]/75 to-transparent" />
                      <span className="absolute left-4 bottom-4 bg-white/95 text-[#7a1f2b] px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase">
                        {editingProg.level || 'Undergraduate'}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h5 className="font-display font-extrabold text-[#0b2341] text-base leading-snug">
                        {editingProg.title || 'Programme title preview'}
                      </h5>
                      <p className="text-xs text-slate-500 leading-5 line-clamp-4">
                        {editingProg.description || 'Programme description will appear here on the public academic card.'}
                      </p>
                      <div className="grid gap-2 border-t pt-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <BookOpen className="w-3.5 h-3.5 text-[#b68a2a]" />
                          {editingProg.duration || 'Duration'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <Download className="w-3.5 h-3.5 text-[#b68a2a]" />
                          Syllabus link: {editingProg.downloadUrl ? 'Set' : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {programmes.filter((programme) => !activeProgrammeSlug || programme.slug === activeProgrammeSlug).length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3 border border-dashed border-slate-300 rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">
                    No programme records are available for this selection.
                  </div>
                )}
                {programmes.filter((programme) => !activeProgrammeSlug || programme.slug === activeProgrammeSlug).map((p, index) => (
                  <article key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-[#b68a2a] hover:shadow-md transition">
                    <div className="h-36 bg-[#0b2341] relative overflow-hidden">
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover transition duration-300 hover:scale-105" alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/70">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b2341]/80 to-transparent" />
                      <span className="absolute right-3 top-3 bg-[#0b2341]/85 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-extrabold">
                        BA {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="absolute left-3 bottom-3 bg-white text-[#7a1f2b] text-[9px] px-2 py-0.5 rounded-full uppercase font-extrabold">
                        {p.level} • {p.duration}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-display font-extrabold text-sm text-[#0b2341] leading-snug">{p.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Slug: {p.slug}</p>
                      </div>
                      <p className="text-xs text-slate-500 leading-5 line-clamp-3">{p.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <span className="rounded-lg bg-[#f7f4ee] px-2 py-1 font-bold text-slate-600">Image: {p.image ? 'Set' : 'Missing'}</span>
                        <span className="rounded-lg bg-[#f7f4ee] px-2 py-1 font-bold text-slate-600">PDF: {p.downloadUrl && p.downloadUrl !== '#' ? 'Set' : 'Missing'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Public card preview</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProg(p)} className="text-clcs-navy p-1.5 hover:bg-slate-100 rounded border" aria-label={`Edit ${p.title}`}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProgramme(p.id)} className="text-red-700 p-1.5 hover:bg-slate-100 rounded border" aria-label={`Delete ${p.title}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESEARCH PUBLICATIONS */}
          {activeSubTab === 'research' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Research Publications</h4>
                  <p className="text-xs text-gray-500">Edit featured journal items shown on the public Research page.</p>
                </div>
                {!editingPublication && (
                  <button
                    onClick={() => setEditingPublication({ title: '', author: '', journalName: 'Rigzoed Journal', year: new Date().getFullYear().toString(), description: '', pdfUrl: '#', externalLink: '#' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Publication
                  </button>
                )}
              </div>

              {editingPublication && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl text-xs">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">{editingPublication.id ? 'Edit Publication' : 'Create Publication'}</h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Publication Title *</label>
                      <input
                        type="text"
                        value={editingPublication.title || ''}
                        onChange={(e) => setEditingPublication({ ...editingPublication, title: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Author *</label>
                        <input
                          type="text"
                          value={editingPublication.author || ''}
                          onChange={(e) => setEditingPublication({ ...editingPublication, author: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Year</label>
                        <input
                          type="text"
                          value={editingPublication.year || ''}
                          onChange={(e) => setEditingPublication({ ...editingPublication, year: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Journal Name</label>
                      <input
                        type="text"
                        value={editingPublication.journalName || ''}
                        onChange={(e) => setEditingPublication({ ...editingPublication, journalName: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Description</label>
                      <textarea
                        value={editingPublication.description || ''}
                        onChange={(e) => setEditingPublication({ ...editingPublication, description: e.target.value })}
                        className="w-full border rounded p-2 mt-1 h-24 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">PDF Link</label>
                        <input
                          type="text"
                          value={editingPublication.pdfUrl || ''}
                          onChange={(e) => setEditingPublication({ ...editingPublication, pdfUrl: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">External Link</label>
                        <input
                          type="text"
                          value={editingPublication.externalLink || ''}
                          onChange={(e) => setEditingPublication({ ...editingPublication, externalLink: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSavePublication} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">Save Publication</button>
                    <button onClick={() => setEditingPublication(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {publications.map((publication) => (
                  <div key={publication.id} className="p-4 border rounded-lg bg-slate-50/50 flex flex-col md:flex-row justify-between gap-3 text-xs">
                    <div>
                      <p className="text-[9px] text-[#7a1f2b] font-extrabold uppercase">{publication.journalName} • {publication.year}</p>
                      <h5 className="font-bold text-slate-800 mt-1">{publication.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Author: {publication.author}</p>
                    </div>
                    <div className="flex gap-1 self-start md:self-center">
                      <button onClick={() => setEditingPublication(publication)} className="text-clcs-navy p-1 border bg-white rounded"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeletePublication(publication.id)} className="text-red-700 p-1 border bg-white rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESEARCH NEWS & EVENTS */}
          {activeSubTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Research News & Events</h4>
                  <p className="text-xs text-gray-500">Maintain research centre updates, event notes, images, and topic tags.</p>
                </div>
                {!editingNews && (
                  <button
                    onClick={() => setEditingNews({ title: '', date: new Date().toISOString().split('T')[0], description: '', image: '', tags: [] })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add News
                  </button>
                )}
              </div>

              {editingNews && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl text-xs">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">{editingNews.id ? 'Edit Research News' : 'Create Research News'}</h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Headline *</label>
                      <input
                        type="text"
                        value={editingNews.title || ''}
                        onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Date</label>
                        <input
                          type="date"
                          value={editingNews.date || ''}
                          onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Tags</label>
                        <input
                          type="text"
                          value={(editingNews.tags || []).join(', ')}
                          onChange={(e) => setEditingNews({
                            ...editingNews,
                            tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                          })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                          placeholder="Research, Journal, Conference"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Description *</label>
                      <textarea
                        value={editingNews.description || ''}
                        onChange={(e) => setEditingNews({ ...editingNews, description: e.target.value })}
                        className="w-full border rounded p-2 mt-1 h-24 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Image URL</label>
                      <input
                        type="text"
                        value={editingNews.image || ''}
                        onChange={(e) => setEditingNews({ ...editingNews, image: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveNews} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">Save News</button>
                    <button onClick={() => setEditingNews(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {newsEvents.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-slate-50/50 flex flex-col md:flex-row justify-between gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                      <h5 className="font-bold text-slate-800 mt-1">{item.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex gap-1 self-start md:self-center">
                      <button onClick={() => setEditingNews(item)} className="text-clcs-navy p-1 border bg-white rounded"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteNews(item.id)} className="text-red-700 p-1 border bg-white rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTICES & ANN */}
          {activeSubTab === 'announcements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Announcement Records</h4>
                  <p className="text-xs text-gray-500">Maintain announcements, tenders, job vacancies, and news and events records.</p>
                </div>
                {!editingAnn && (
                  <button 
                    onClick={() => setEditingAnn({ title: '', category: activeAnnouncementCategory || 'Announcements', description: '', date: new Date().toISOString().split('T')[0], status: 'active', pdfUrl: '#' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Notice
                  </button>
                )}
              </div>

              {editingAnn && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl text-xs">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">{editingAnn.id ? 'Edit Notice' : 'Post New Notice'}</h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Notice Bulletin Title *</label>
                      <input 
                        type="text" 
                        value={editingAnn.title || ''} 
                        onChange={(e) => setEditingAnn({...editingAnn, title: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Broadcasting Category *</label>
                        <select 
                          value={editingAnn.category || 'Announcements'}
                          onChange={(e) => setEditingAnn({...editingAnn, category: e.target.value as any})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        >
                          <option value="Announcements">Announcements</option>
                          <option value="Tenders">Tenders</option>
                          <option value="Job Vacancies">Job Vacancies</option>
                          <option value="News and Events">News and Events</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Broadcast Date</label>
                        <input 
                          type="date" 
                          value={editingAnn.date || ''} 
                          onChange={(e) => setEditingAnn({...editingAnn, date: e.target.value})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Notice Status</label>
                        <select 
                          value={editingAnn.status || 'active'}
                          onChange={(e) => setEditingAnn({...editingAnn, status: e.target.value as any})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        >
                          <option value="active">Active (Visible)</option>
                          <option value="inactive">Draft / Hidden</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Notice Description Text</label>
                      <textarea 
                        value={editingAnn.description || ''} 
                        onChange={(e) => setEditingAnn({...editingAnn, description: e.target.value})}
                        className="w-full border rounded p-2 mt-1 h-20 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">PDF/Document Download Link</label>
                        <input 
                          type="text" 
                          value={editingAnn.pdfUrl || ''} 
                          onChange={(e) => setEditingAnn({...editingAnn, pdfUrl: e.target.value})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Optional Accent Image URL</label>
                        <input 
                          type="text" 
                          value={editingAnn.image || ''} 
                          onChange={(e) => setEditingAnn({...editingAnn, image: e.target.value})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveAnnouncement} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">
                      Broadcast To Board
                    </button>
                    <button onClick={() => setEditingAnn(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {announcements.filter((announcement) => !activeAnnouncementCategory || announcement.category === activeAnnouncementCategory).map(a => (
                  <div key={a.id} className="border border-slate-100 rounded p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="bg-clcs-maroon/10 text-clcs-maroon text-[9px] px-2 py-0.5 rounded font-extrabold">
                          {a.category}
                        </span>
                        {a.status === 'inactive' && (
                          <span className="bg-slate-400 text-white text-[8px] px-1.5 rounded uppercase">DRAFT</span>
                        )}
                        <span className="text-gray-400 text-[10px]">{a.date}</span>
                      </div>
                      <h6 className="font-bold text-slate-800 mt-1">{a.title}</h6>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditingAnn(a)} className="text-clcs-navy p-1 border rounded bg-white">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-red-700 p-1 border rounded bg-white">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STAFF PROFILES */}
          {activeSubTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">
                    {activeProfileType === 'faculty' ? 'Faculty Profiles Registry' : 'Staff Profiles Registry'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Manage {activeProfileType === 'faculty' ? 'teaching and academic faculty' : 'administrative and support staff'} profiles separately.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProfileType('staff')}
                    className={`rounded border px-3 py-2 text-xs font-bold cursor-pointer ${activeProfileType === 'staff' ? 'border-[#0b2341] bg-[#0b2341] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    Staff ({staffProfiles.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProfileType('faculty')}
                    className={`rounded border px-3 py-2 text-xs font-bold cursor-pointer ${activeProfileType === 'faculty' ? 'border-[#0b2341] bg-[#0b2341] text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    Faculty ({facultyProfiles.length})
                  </button>
                </div>
                {!editingStaff && (
                  <button 
                    onClick={() => setEditingStaff({ name: '', profileType: activeProfileType, designation: '', department: activeProfileType === 'faculty' ? 'Department of Language Studies' : 'Administration', email: '', order: 10, bio: '', image: '', linkedInUrl: '', cvUrl: '', researchUrl: '' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add {activeProfileType === 'faculty' ? 'Faculty' : 'Staff'}
                  </button>
                )}
              </div>

              {editingStaff && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl text-xs">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">
                    {editingStaff.id ? 'Edit Profile Details' : `Register New ${activeProfileType === 'faculty' ? 'Faculty' : 'Staff'} Member`}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Profile Category *</label>
                      <select
                        value={editingStaff.profileType || activeProfileType}
                        onChange={(e) => {
                          const profileType = e.target.value as 'staff' | 'faculty';
                          setEditingStaff({ ...editingStaff, profileType });
                          setActiveProfileType(profileType);
                        }}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      >
                        <option value="staff">Staff Profile</option>
                        <option value="faculty">Faculty Profile</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Full Name *</label>
                      <input 
                        type="text" 
                        value={editingStaff.name || ''} 
                        onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Designation Role *</label>
                      <input 
                        type="text" 
                        value={editingStaff.designation || ''} 
                        onChange={(e) => setEditingStaff({...editingStaff, designation: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={editingStaff.phone || ''}
                        onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        placeholder="e.g. +975 17 00 00 00"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Email Address *</label>
                      <input 
                        type="email" 
                        value={editingStaff.email || ''} 
                        onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        placeholder="e.g. name@rub.edu.bt"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Sort Priority Order Badge (Lower numbers top-ranked)</label>
                      <input 
                        type="number" 
                        value={editingStaff.order || 50} 
                        onChange={(e) => setEditingStaff({...editingStaff, order: Number(e.target.value)})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">LinkedIn URL</label>
                      <input
                        type="url"
                        value={editingStaff.linkedInUrl || ''}
                        onChange={(e) => setEditingStaff({...editingStaff, linkedInUrl: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        placeholder="https://linkedin.com/in/name"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">CV / Resume Link</label>
                      <input
                        type="url"
                        value={editingStaff.cvUrl || ''}
                        onChange={(e) => setEditingStaff({...editingStaff, cvUrl: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        placeholder="https://example.com/cv.pdf"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700">External Research Link</label>
                      <input
                        type="url"
                        value={editingStaff.researchUrl || ''}
                        onChange={(e) => setEditingStaff({...editingStaff, researchUrl: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        placeholder="Google Scholar, ORCID, ResearchGate, publication page, or personal research profile"
                      />
                    </div>
                    <div className="rounded border border-slate-200 bg-white p-2">
                      <label className="block font-semibold text-slate-700">Avatar Image</label>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center shrink-0">
                          {editingStaff.image ? (
                            <img src={editingStaff.image} alt="Avatar preview" className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                          ) : (
                            <Users className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleStaffAvatarUpload}
                            className="block w-full text-[10px] file:mr-2 file:rounded file:border-0 file:bg-[#0b2341] file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white cursor-pointer"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            {editingStaff.image && (
                              <button
                                type="button"
                                onClick={() => setEditingStaff({ ...editingStaff, image: '' })}
                                className="rounded border px-2 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                            <p className="text-[9px] text-slate-400">PNG, JPG, WEBP, or GIF. Maximum 1 MB.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700">Short Profile Biography Text</label>
                      <textarea 
                        value={editingStaff.bio || ''} 
                        onChange={(e) => setEditingStaff({...editingStaff, bio: e.target.value})}
                        className="w-full border rounded p-2 mt-1 h-16 bg-white text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveStaff} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">
                      Save {editingStaff.profileType === 'faculty' ? 'Faculty' : 'Staff'} Profile
                    </button>
                    <button onClick={() => setEditingStaff(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleProfiles.length === 0 && (
                  <div className="md:col-span-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                    No {activeProfileType === 'faculty' ? 'faculty' : 'staff'} profiles are registered yet.
                  </div>
                )}
                {visibleProfiles.map(s => (
                  <div key={s.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex gap-3 items-center">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-10 h-10 object-cover bg-slate-200 rounded-full" loading="lazy" decoding="async" />
                      ) : (
                        <span className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-slate-500" />
                        </span>
                      )}
                      <div>
                        <h6 className="font-bold text-slate-800">{s.name}</h6>
                        <p className="text-[10px] text-gray-500">{s.designation}</p>
                        <p className="text-[9px] text-[#0b2341] font-semibold mt-0.5">
                          {(s.profileType === 'faculty' ? 'Faculty' : 'Staff')} • {s.phone || 'No phone number'} • Order #{s.order}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setActiveProfileType(s.profileType === 'faculty' ? 'faculty' : 'staff');
                          setEditingStaff(s);
                        }}
                        className="text-clcs-navy p-1 border bg-white rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteStaff(s.id)} className="text-red-700 p-1 border bg-white rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STUDENT SERVICES */}
          {activeSubTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Student Services</h4>
                  <p className="text-xs text-gray-500">Edit service cards and detail text shown on the public Student Services page.</p>
                </div>
                {!editingService && (
                  <button
                    onClick={() => setEditingService({ title: '', description: '', content: '', image: '', icon: 'Home' })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                )}
              </div>

              {editingService && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-xl text-xs">
                  <h5 className="font-bold text-xs text-[#0b2341] uppercase">{editingService.id ? 'Edit Service' : 'Create Service'}</h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Service Title *</label>
                      <input
                        type="text"
                        value={editingService.title || ''}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Slug</label>
                        <input
                          type="text"
                          value={editingService.slug || ''}
                          onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                          placeholder="Generated from title if blank"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">Icon Name</label>
                        <input
                          type="text"
                          value={editingService.icon || ''}
                          onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Short Description *</label>
                      <textarea
                        value={editingService.description || ''}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full border rounded p-2 mt-1 h-20 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Image URL</label>
                      <input
                        type="text"
                        value={editingService.image || ''}
                        onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Detail Content Markdown</label>
                      <textarea
                        value={editingService.content || ''}
                        onChange={(e) => setEditingService({ ...editingService, content: e.target.value })}
                        className="w-full border rounded p-2 mt-1 h-32 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveService} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">Save Service</button>
                    <button onClick={() => setEditingService(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.filter((service) => !activeServiceSlug || service.slug === activeServiceSlug).map((service) => (
                  <div key={service.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex gap-3 items-center min-w-0">
                      <img src={service.image} alt={service.title} className="w-12 h-10 rounded object-cover bg-slate-200" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <h6 className="font-bold text-slate-800 line-clamp-1">{service.title}</h6>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingService(service)} className="text-clcs-navy p-1 border bg-white rounded"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteService(service.id)} className="text-red-700 p-1 border bg-white rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                {activeServiceSlug && !services.some((service) => service.slug === activeServiceSlug) && (
                  <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-xs text-slate-500">
                    This student service record is not available yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DOWNLOAD CATALOG */}
          {activeSubTab === 'downloads' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Student Downloads & Registry</h4>
                  <p className="text-xs text-gray-500">Provide official PDFs, handbooks, scholarship rules, and academic guidelines.</p>
                </div>
                {!editingDownload && (
                  <button 
                    onClick={() => setEditingDownload({
                      title: '',
                      category: activeDownloadCategory || 'admission-forms',
                      fileUrl: '#',
                      fileSize: activeDownloadCategory === 'academic-calendar' ? 'Calendar entry' : '1.2 MB',
                      calendarType: activeDownloadCategory === 'academic-calendar' ? 'event' : undefined
                    })}
                    className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> {activeDownloadCategory === 'academic-calendar' ? 'Add Calendar Entry' : 'Add File'}
                  </button>
                )}
              </div>

              {editingDownload && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-w-4xl text-xs">
                  <h5 className="font-bold text-[#0b2341] uppercase">
                    {editingDownload.category === 'academic-calendar' ? 'Register Academic Calendar Entry' : 'Register Downloadable Asset'}
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block font-semibold">{editingDownload.category === 'academic-calendar' ? 'Calendar Entry Title *' : 'Document Form Title *'}</label>
                      <input 
                        type="text" 
                        value={editingDownload.title || ''} 
                        onChange={(e) => setEditingDownload({...editingDownload, title: e.target.value})}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold">Asset Category *</label>
                        <select 
                          value={activeDownloadCategory || editingDownload.category || 'admission-forms'}
                          onChange={(e) => {
                            const category = e.target.value as DownloadItem['category'];
                            setEditingDownload({
                              ...editingDownload,
                              category,
                              fileSize: category === 'academic-calendar' && !editingDownload.fileSize ? 'Calendar entry' : editingDownload.fileSize,
                              calendarType: category === 'academic-calendar' ? editingDownload.calendarType || 'event' : editingDownload.calendarType
                            });
                          }}
                          disabled={!!activeDownloadCategory}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                        >
                          <option value="academic-calendar">Academic Calendar</option>
                          <option value="admission-forms">Admission Forms</option>
                          <option value="research-forms">Research Forms</option>
                          <option value="student-handbook">Student Handbook</option>
                          <option value="other">Other PDF / Documents</option>
                        </select>
                        {activeDownloadCategory && (
                          <p className="mt-1 text-[10px] text-slate-500">
                            Locked to the selected admin section.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block font-semibold">{editingDownload.category === 'academic-calendar' ? 'Attachment Upload' : 'Document Upload *'}</label>
                        <label className="mt-1 flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#0b2341] hover:border-[#b68a2a] hover:bg-[#f7f4ee]">
                          <Upload className="h-3.5 w-3.5" />
                          Choose file
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf"
                            onChange={handleDownloadDocumentUpload}
                            className="sr-only"
                          />
                        </label>
                        <p className="mt-1 min-h-4 truncate font-mono text-[10px] text-slate-500">
                          {editingDownload.fileUrl && editingDownload.fileUrl !== '#' ? editingDownload.fileUrl : 'No file uploaded yet'}
                        </p>
                      </div>
                      <div>
                        <label className="block font-semibold">{editingDownload.category === 'academic-calendar' ? 'Attachment Label / Size' : 'Estimated File Size'}</label>
                        <input 
                          type="text" 
                          value={editingDownload.fileSize || ''} 
                          onChange={(e) => setEditingDownload({...editingDownload, fileSize: e.target.value})}
                          className="w-full border rounded p-2 mt-1 bg-white text-xs"
                          placeholder="e.g. 1.2 MB or 850 KB"
                        />
                      </div>
                    </div>
                    {editingDownload.category === 'academic-calendar' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border rounded-xl p-3">
                        <div>
                          <label className="block font-semibold">Start Date *</label>
                          <input
                            type="date"
                            value={editingDownload.calendarDate || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, calendarDate: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold">End Date</label>
                          <input
                            type="date"
                            value={editingDownload.calendarEndDate || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, calendarEndDate: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold">Time</label>
                          <input
                            type="text"
                            value={editingDownload.calendarTime || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, calendarTime: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                            placeholder="9:00 AM"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold">Event Type</label>
                          <select
                            value={editingDownload.calendarType || 'event'}
                            onChange={(e) => setEditingDownload({ ...editingDownload, calendarType: e.target.value as DownloadItem['calendarType'] })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                          >
                            <option value="semester">Semester</option>
                            <option value="exam">Examination</option>
                            <option value="admission">Admission</option>
                            <option value="deadline">Deadline</option>
                            <option value="holiday">Holiday</option>
                            <option value="event">Event</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-semibold">Venue</label>
                          <input
                            type="text"
                            value={editingDownload.calendarVenue || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, calendarVenue: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                            placeholder="Academic Block / Auditorium"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-semibold">Short Description</label>
                          <input
                            type="text"
                            value={editingDownload.description || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, description: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs"
                            placeholder="Brief note shown on the public calendar"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block font-semibold">Optional Event Link</label>
                          <input
                            type="url"
                            value={editingDownload.eventUrl || ''}
                            onChange={(e) => setEditingDownload({ ...editingDownload, eventUrl: e.target.value })}
                            className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                            placeholder="https://example.edu.bt/event-details"
                          />
                          <p className="mt-1 text-[10px] text-slate-400">Optional. Use this for registration pages, circulars, livestreams, or event details.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveDownload} className="bg-[#0b2341] text-white text-xs py-2 px-4 font-bold rounded cursor-pointer">
                      {editingDownload.category === 'academic-calendar' ? 'Save Calendar Entry' : 'Save Document Item'}
                    </button>
                    <button onClick={() => setEditingDownload(null)} className="bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {downloads.filter((download) => !activeDownloadCategory || download.category === activeDownloadCategory).map(d => (
                  <div key={d.id} className="p-3 border rounded bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="bg-[#0b2341]/5 text-[#0b2341] text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">{d.category}</span>
                      <h6 className="font-bold text-slate-800 mt-1">{d.title}</h6>
                      {d.category === 'academic-calendar' ? (
                        <p className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                          <span><CalendarDays className="w-3 h-3 inline mr-0.5" /> {d.calendarDate || d.dateAdded}</span>
                          <span>{d.calendarType || 'event'}</span>
                          {d.calendarVenue && <span>{d.calendarVenue}</span>}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-0.5">Size: {d.fileSize} • URL: {d.fileUrl}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setEditingDownload(d)} className="text-clcs-navy p-1 hover:bg-white rounded border flex-shrink-0">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteDownload(d.id)} className="text-red-700 p-1 hover:bg-white rounded border flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FOOTER LINKS */}
          {activeSubTab === 'footer' && (
            <div className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="text-[#0b2341] font-display font-extrabold text-lg">Footer Content & Link Columns</h4>
                  <p className="text-xs text-gray-500">Manage the Web Links, Useful Links, and College Online System columns shown in the website footer.</p>
                </div>
                <button
                  onClick={() => setFooterLinks((links) => [
                    ...links,
                    { id: `footer-${Date.now()}`, title: 'New Footer Link', url: '#', category: 'Web Links' }
                  ])}
                  className="bg-clcs-navy text-white font-bold text-xs py-2 px-3 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Footer Link
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h5 className="font-bold text-slate-800">Link target examples</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-500">
                  <code className="bg-white border rounded p-2">academics</code>
                  <code className="bg-white border rounded p-2">about:overview</code>
                  <code className="bg-white border rounded p-2">https://www.rub.edu.bt</code>
                </div>
              </div>

              <div className="space-y-3">
                {footerLinks.length === 0 && (
                  <div className="border border-dashed rounded-xl p-6 text-center text-slate-500">
                    No footer links are published yet.
                  </div>
                )}
                {footerLinks.map((link) => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-[1fr_11rem_1fr_auto] gap-3 items-end bg-slate-50 border rounded-xl p-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Link Title</label>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => setFooterLinks((links) => links.map((item) => item.id === link.id
                          ? { ...item, title: e.target.value }
                          : item))}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Footer Column</label>
                      <select
                        value={link.category}
                        onChange={(e) => setFooterLinks((links) => links.map((item) => item.id === link.id
                          ? { ...item, category: e.target.value as FooterLink['category'] }
                          : item))}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs"
                      >
                        <option value="Web Links">Web Links</option>
                        <option value="Useful Links">Useful Links</option>
                        <option value="College Online System">College Online System</option>
                        <option value="Quick Links">Quick Links</option>
                        <option value="Resources">Resources</option>
                        <option value="Portals">Portals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">URL or Internal Route</label>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => setFooterLinks((links) => links.map((item) => item.id === link.id
                          ? { ...item, url: e.target.value }
                          : item))}
                        className="w-full border rounded p-2 mt-1 bg-white text-xs font-mono"
                      />
                    </div>
                    <button
                      onClick={() => setFooterLinks((links) => links.filter((item) => item.id !== link.id))}
                      aria-label={`Remove ${link.title} footer link`}
                      className="h-9 px-3 border rounded text-red-700 bg-white hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveFooterLinks}
                className="bg-[#0b2341] text-white font-bold text-xs py-2 px-4 rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Footer Links
              </button>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeSubTab === 'gallery' && (
            <div className="space-y-6 text-xs">
              <div className="border-b pb-3">
                <h4 className="text-[#0b2341] font-display font-extrabold text-lg">College Photo Gallery Library</h4>
                <p className="text-xs text-gray-500">Exhibit campus events, architecture and cultural rituals.</p>
              </div>

              {/* Simple Quick Add bar */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <h5 className="font-bold text-slate-800">Add New Photo Record</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold">Photo Label/Caption *</label>
                    <input 
                      type="text" 
                      value={newGalleryTitle} 
                      onChange={(e) => setNewGalleryTitle(e.target.value)}
                      placeholder="e.g. Hostels in Morning Mist"
                      className="w-full border rounded mt-1 p-2 bg-white text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Image URL *</label>
                    <input 
                      type="text" 
                      value={newGalleryUrl} 
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border rounded mt-1 p-2 bg-white text-xs font-mono" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Category Segment</label>
                    <select 
                      value={newGalleryCategory}
                      onChange={(e) => setNewGalleryCategory(e.target.value)}
                      className="w-full border rounded mt-1 p-2 bg-white text-xs"
                    >
                      <option value="Campus">Campus</option>
                      <option value="Culture">Culture</option>
                      <option value="Events">Events</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleSaveGallery}
                  className="bg-clcs-navy hover:bg-clcs-maroon text-white font-bold py-1.5 px-3 rounded text-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Save Photo Record
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {gallery.map(g => (
                  <div key={g.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50/50 flex flex-col justify-between">
                    <img src={g.imageUrl} alt={g.title} className="w-full h-24 object-cover rounded bg-slate-300" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                    <div className="mt-2 text-[10px]">
                      <span className="text-[8px] bg-[#b68a2a]/20 text-[#0b2341] font-bold px-1.5 rounded uppercase">{g.category}</span>
                      <p className="font-bold text-slate-700 line-clamp-1 mt-1">{g.title}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteGallery(g.id)}
                      className="text-red-700 p-1 mt-2 text-center hover:bg-red-50 hover:border-red-200 rounded border block w-full duration-150 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SYSTEM CONFIGURATION */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b pb-3">
                <h4 className="text-[#0b2341] font-display font-extrabold text-lg">System Configuration & Metadata Registry</h4>
                <p className="text-xs text-gray-500">Configure global parameters inside metadata logs directly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase">College Name (English) *</label>
                  <input 
                    type="text" 
                    value={colNameEn} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setColNameEn(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2.5 bg-white text-xs font-bold text-slate-800" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase">College Name (Dzongkha) *</label>
                  <input 
                    type="text" 
                    value={colNameDz} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setColNameDz(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2.5 bg-white text-xs font-bold text-slate-800" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase">Site Subtitle Header Placement *</label>
                  <input 
                    type="text" 
                    value={siteSubtitle} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setSiteSubtitle(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2.5 bg-white text-xs" 
                  />
                </div>

                <div className="col-span-2 rounded-lg border border-slate-200 p-3">
                  <label className="block font-bold text-slate-700 uppercase">Header Logo Images</label>
                  <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className="block font-semibold text-slate-800">College Logo</span>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                            onChange={(event) => handleLogoUpload(event, 'primary')}
                            className="block w-full rounded border bg-white p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#0b2341] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white cursor-pointer"
                          />
                          {logoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettingsFormDirty(true);
                                setLogoUrl('');
                              }}
                              className="rounded border bg-white px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              Remove College Logo
                            </button>
                          )}
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-[#b68a2a] bg-[#7a1f2b] overflow-hidden flex items-center justify-center">
                          {logoUrl ? (
                            <img src={logoUrl} alt="College logo preview" className="w-full h-full object-cover bg-white" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                          ) : (
                            <Landmark className="w-7 h-7 text-[#b68a2a]" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <span className="block font-semibold text-slate-800">Royal University / Secondary Logo</span>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                            onChange={(event) => handleLogoUpload(event, 'secondary')}
                            className="block w-full rounded border bg-white p-2 text-xs file:mr-3 file:rounded file:border-0 file:bg-[#0b2341] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white cursor-pointer"
                          />
                          {secondaryLogoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettingsFormDirty(true);
                                setSecondaryLogoUrl('');
                              }}
                              className="rounded border bg-white px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              Remove Secondary Logo
                            </button>
                          )}
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-slate-300 bg-white overflow-hidden flex items-center justify-center">
                          {secondaryLogoUrl ? (
                            <img src={secondaryLogoUrl} alt="Secondary logo preview" className="w-full h-full object-contain bg-white p-1" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                          ) : (
                            <Landmark className="w-7 h-7 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-400">PNG, JPG, WEBP, GIF, or SVG. Maximum 1 MB each. Save system records after selecting or removing logos.</p>
                </div>

                <div className="col-span-2 bg-[#f7f4ee] border border-[#b68a2a]/30 p-3 rounded-lg">
                  <label className="block font-bold text-[#7a1f2b] uppercase flex items-center gap-1">
                    <Megaphone className="w-4 h-4" /> Global Notice Alert Ribbon (Maroon Topbar Banner Text)
                  </label>
                  <input 
                    type="text" 
                    value={alertTxt} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setAlertTxt(e.target.value);
                    }}
                    placeholder="e.g. Admissions are open for class 2026!"
                    className="w-full border border-slate-300 rounded mt-1.5 p-2 bg-white text-xs" 
                  />
                  <div className="mt-3">
                    <label className="block font-semibold text-[#0b2341]">Ribbon Link Target</label>
                    <select
                      value={alertTarget}
                      onChange={(e) => {
                        setSettingsFormDirty(true);
                        setAlertTarget(e.target.value);
                      }}
                      className="w-full border border-slate-300 rounded mt-1 p-2 bg-white text-xs"
                    >
                      <optgroup label="Main Client Pages">
                        <option value="none">No Link</option>
                        <option value="home">Home</option>
                        <option value="about">About</option>
                        <option value="academics">Academics</option>
                        <option value="admissions">Admissions</option>
                        <option value="research">Research</option>
                        <option value="services">Student Services</option>
                        <option value="announcements">Announcements</option>
                        <option value="gallery">Gallery</option>
                        <option value="downloads">Downloads</option>
                        <option value="contact">Contact</option>
                      </optgroup>
                      <optgroup label="Editable Submenu Pages">
                        {pages
                          .filter((page) => ['about', 'academics', 'admissions', 'research', 'announcements'].includes(page.category))
                          .map((page) => (
                            <option key={page.id} value={`${page.category}:${page.slug}`}>
                              {page.category}: {page.title}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="col-span-2 space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="block font-semibold text-slate-800">Header Social Links</span>
                      <span className="text-[10px] text-gray-400">These links appear in the top header bar.</span>
                    </div>
                    <button
                      onClick={() => setSocialLinks((links) => [
                        ...links,
                        { id: `social-${Date.now()}`, platform: 'facebook', url: '' }
                      ])}
                      className="bg-clcs-navy text-white font-bold text-xs py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Social Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_auto] gap-2 items-end bg-slate-50 border rounded p-2">
                        <div>
                          <label className="block font-semibold text-slate-600">Platform</label>
                          <select
                            value={link.platform}
                            onChange={(e) => setSocialLinks((links) => links.map((item) => item.id === link.id
                              ? { ...item, platform: e.target.value as SocialLink['platform'] }
                              : item))}
                            className="w-full border rounded mt-1 p-2 bg-white text-xs"
                          >
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter / X</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600">Profile URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => setSocialLinks((links) => links.map((item) => item.id === link.id
                              ? { ...item, url: e.target.value }
                              : item))}
                            className="w-full border rounded mt-1 p-2 bg-white text-xs font-mono"
                          />
                        </div>
                        <button
                          onClick={() => setSocialLinks((links) => links.filter((item) => item.id !== link.id))}
                          aria-label={`Remove ${link.platform} social link`}
                          className="h-8 px-2 border rounded text-red-700 bg-white hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveSocialLinks}
                    className="bg-[#0b2341] text-white font-bold text-xs py-2 px-4 rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Social Links
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase">Interactive Contacts Phone Range</label>
                  <input 
                    type="text" 
                    value={phoneVal} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setPhoneVal(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2 bg-white text-xs" 
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase font-sans">Official Admissions Email</label>
                  <input 
                    type="email" 
                    value={emailVal} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setEmailVal(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2 bg-white text-xs" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase font-sans">Physical Address Location</label>
                  <input 
                    type="text" 
                    value={addressVal} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setAddressVal(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2 bg-white text-xs" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase font-mono">Google Map Embed Code (src value)</label>
                  <input 
                    type="text" 
                    value={mapVal} 
                    onChange={(e) => {
                      setSettingsFormDirty(true);
                      setMapVal(e.target.value);
                    }}
                    className="w-full border rounded mt-1 p-2 bg-white text-[11px] font-mono" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveGlobalSettings}
                className="bg-[#0b2341] hover:bg-clcs-maroon text-white font-bold text-xs py-2.5 px-6 rounded shadow flex items-center gap-1.5 cursor-pointer leading-none"
              >
                <Save className="w-4 h-4" /> Save System Records
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
