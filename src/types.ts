export interface Admin {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'editor';
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  category: 'about' | 'academics' | 'admissions' | 'research' | 'announcements' | 'services' | 'other';
  externalUrl?: string;
  enabled?: boolean;
  content: string;
  lastUpdated: string;
}

export interface Programme {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  duration: string;
  eligibility: string;
  level: string;
  downloadUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Announcements' | 'Job Vacancies' | 'Tenders' | 'News and Events';
  date: string;
  description: string;
  image: string;
  pdfUrl: string;
  status: 'active' | 'inactive';
}

export interface NewsEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  tags: string[];
}

export interface StaffProfile {
  id: string;
  name: string;
  profileType?: 'staff' | 'faculty';
  designation: string;
  department: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  cvUrl?: string;
  researchUrl?: string;
  image: string;
  bio: string;
  order: number;
}

export interface ResearchPublication {
  id: string;
  title: string;
  author: string;
  journalName: string;
  year: string;
  description: string;
  pdfUrl: string;
  externalLink: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export interface StudentService {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  content: string;
}

export interface HomepageSlider {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  videoUrl?: string;
  ctaEnabled?: boolean;
  virtualTourEnabled?: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: 'academic-calendar' | 'admission-forms' | 'research-forms' | 'student-handbook' | 'other';
  fileUrl: string;
  fileSize: string;
  dateAdded: string;
  calendarDate?: string;
  calendarEndDate?: string;
  calendarTime?: string;
  calendarVenue?: string;
  calendarType?: 'semester' | 'exam' | 'admission' | 'deadline' | 'holiday' | 'event';
  eventUrl?: string;
  description?: string;
}

export interface ContactInfo {
  collegeName: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  workingHours: string;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'youtube' | 'instagram' | 'linkedin';
  url: string;
}

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  category: 'Web Links' | 'Useful Links' | 'College Online System' | 'Quick Links' | 'Resources' | 'Portals';
}

export interface CollegeSettings {
  collegeNameEnglish: string;
  collegeNameDzongkha: string;
  siteSubtitle: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  navbarAlert?: string;
  navbarAlertTarget?: string;
  isEnrollmentOpen: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
