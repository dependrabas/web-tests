import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Interface Definitions to match user requirements
export interface Admin {
  id: string;
  username: string;
  passwordHash: string; // SHA256 hashed
  role: 'admin' | 'editor';
  fullName: string;
}

export interface Page {
  id: string;
  slug: string; // e.g. 'overview', 'vision-mission', 'history'
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
  duration: string; // e.g. "3 Years" or "4 Years"
  eligibility: string;
  level: string; // "Undergraduate" or "Postgraduate"
  downloadUrl: string; // PDF link
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
  department: string; // e.g. "Department of Language Studies", "Department of Bhutanese Studies"
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
  journalName: string; // e.g. "Rigzoed Journal"
  year: string;
  description: string;
  pdfUrl: string;
  externalLink: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string; // e.g. "Campus", "Culture", "Events"
  imageUrl: string;
}

export interface StudentService {
  id: string;
  slug: string; // e.g. 'campus-life', 'it-lab', 'language-centre'
  title: string;
  description: string;
  icon: string; // Lucide icon string
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

export interface DatabaseSchema {
  admins: Admin[];
  pages: Page[];
  programmes: Programme[];
  announcements: Announcement[];
  newsEvents: NewsEvent[];
  staffProfiles: StaffProfile[];
  researchPublications: ResearchPublication[];
  gallery: GalleryItem[];
  studentServices: StudentService[];
  homepageSlider: HomepageSlider[];
  downloads: DownloadItem[];
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  footerLinks: FooterLink[];
  settings: CollegeSettings;
}

// SHA256 helper for password hashing
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to check and verify database
let cachedDb: DatabaseSchema | null = null;

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

export function loadDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  ensureDirectoryExistence(DB_FILE);

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    } catch (e) {
      console.error('Error reading DB, seeding fresh databases', e);
    }
  }

  // Seed with beautiful, authentic Bhutanese college data!
  const defaultDb: DatabaseSchema = {
    admins: [
      {
        id: '1',
        username: 'admin',
        passwordHash: hashPassword('clcs123'), // Secure default, changable in dashboard
        role: 'admin',
        fullName: 'Academic Administrator'
      }
    ],
    settings: {
      collegeNameEnglish: "Trongsa College of Heritage and Contemporary Studies",
      collegeNameDzongkha: "ཀྲོང་གསར་རྒྱལ་རབས་དང་དེང་དུས་རིག་པའི་ཚན་གཙུག།",
      siteSubtitle: "Royal University of Bhutan",
      logoUrl: "",
      secondaryLogoUrl: "",
      navbarAlert: "",
      navbarAlertTarget: "none",
      isEnrollmentOpen: true,
    },
    contactInfo: {
      collegeName: "Trongsa College of Heritage and Contemporary Studies (CLCS)",
      address: "Taktse, Trongsa, Kingdom of Bhutan",
      phone: "+975-03-521151 / +975-03-521252",
      email: "admission.clcs@rub.edu.bt",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.4389658518925!2d90.4981113!3d27.4244444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e19bc000000001%3A0x6bba8ded013bdff1!2sCollege%20of%20Language%20and%20Culture%20Studies!5e0!3m2!1sen!2sbt!4v1700000000000!5m2!1sen!2sbt",
      workingHours: "Monday to Friday: 9:00 AM - 5:00 PM (Saturday morning library open)"
    },
    socialLinks: [
      { id: '1', platform: 'facebook', url: 'https://facebook.com/clcs.rub' },
      { id: '2', platform: 'twitter', url: 'https://twitter.com/clcs_rub' },
      { id: '3', platform: 'youtube', url: 'https://youtube.com/c/clcstrongsa' },
      { id: '4', platform: 'instagram', url: 'https://instagram.com/clcs.rub' }
    ],
    footerLinks: [
      { id: 'web-1', title: 'Royal University of Bhutan', url: 'https://www.rub.edu.bt', category: 'Web Links' },
      { id: 'web-2', title: 'College of Natural Resources', url: '#', category: 'Web Links' },
      { id: 'web-3', title: 'Sherubtse College', url: '#', category: 'Web Links' },
      { id: 'web-4', title: 'College of Science & Technology', url: '#', category: 'Web Links' },
      { id: 'web-5', title: 'Paro College of Education', url: '#', category: 'Web Links' },
      { id: 'web-6', title: 'Jigme Namgyal Engineering College', url: '#', category: 'Web Links' },
      { id: 'web-7', title: 'Samtse College of Education', url: '#', category: 'Web Links' },
      { id: 'web-8', title: 'Gedu College of Business Studies', url: '#', category: 'Web Links' },
      { id: 'web-9', title: 'Gyalpozhing College of Information Technology', url: '#', category: 'Web Links' },
      { id: 'useful-1', title: 'eGP - Electronic Government Procurement System', url: '#', category: 'Useful Links' },
      { id: 'useful-2', title: 'Ministry of Foreign Affairs & External Trade', url: '#', category: 'Useful Links' },
      { id: 'useful-3', title: 'eDATS', url: '#', category: 'Useful Links' },
      { id: 'online-1', title: 'Rigzoed Journal', url: '#', category: 'College Online System' },
      { id: 'online-2', title: 'VLE - Virtual Learning Environment', url: 'https://vle.clcs.edu.bt', category: 'College Online System' },
      { id: 'online-3', title: 'RUB - IMS', url: 'https://ims.rub.edu.bt', category: 'College Online System' },
      { id: 'online-4', title: 'Koha Library', url: '#', category: 'College Online System' },
      { id: 'online-5', title: 'EBSCO', url: '#', category: 'College Online System' },
      { id: 'online-6', title: 'DOAJ', url: 'https://doaj.org', category: 'College Online System' },
      { id: 'online-7', title: 'Research4Life', url: 'https://www.research4life.org', category: 'College Online System' },
      { id: 'online-8', title: 'JSTOR', url: 'https://www.jstor.org', category: 'College Online System' },
      { id: 'online-9', title: 'EIFSTIAT MOOC', url: '#', category: 'College Online System' },
      { id: 'online-10', title: 'RECMS', url: '#', category: 'College Online System' },
      { id: 'online-11', title: 'No Due System', url: '#', category: 'College Online System' }
    ],
    homepageSlider: [
      {
        id: "1",
        title: "Preserving Heritage, Inspiring Innovations",
        subtitle: "Experience elite contemporary learning framed by rich language, history, and ancient Bhutanese wisdom high above the historic valleys of Trongsa.",
        imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1600", // Beautiful scholastic courtyard
        ctaEnabled: true,
        virtualTourEnabled: true,
        ctaText: "Explore Programmes",
        ctaLink: "/academics"
      },
      {
        id: "2",
        title: "Rigzoed Journal & Core Academic Research",
        subtitle: "Promoting deep intellectual inquiry into language, culture, and GNH-inspired contemporary studies in Bhutan.",
        imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1600", // Traditional books/manuscripts
        ctaEnabled: true,
        virtualTourEnabled: true,
        ctaText: "View Publications",
        ctaLink: "/research"
      }
    ],
    pages: [
      {
        id: 'about-overview',
        slug: 'overview',
        title: 'Introduction',
        category: 'about',
        content: `### About the College of Language and Culture Studies (CLCS)

The **College of Language and Culture Studies (CLCS)** is a premier institution dedicated to the preservation, promotion, and advancement of Bhutanese language, culture, and intellectual heritage.

CLCS is located approximately **16 kilometres south of Trongsa town** along the Trongsa–Zhemgang highway, towards **Kuenga Rabten Palace**, which formerly served as the winter residence of Bhutan’s Second King, His Majesty Jigme Wangchuck.

#### 1961 — Establishment
Originally established as **Rigney Lobdra** on **16 July 1961** at Wangdi Tse, Thimphu, under the patronage of the Third King, His Majesty Jigme Dorji Wangchuck.

#### 1961–1963 — Founding Leadership
His Holiness the late **Dilgo Khentse Rinpoche (1910–1991)** served as the first Principal, guiding the institute during its formative years with an initial intake of fifty students.

#### 1961–1980s — Semtokha Dzong
Two months after its establishment, the Lobdra was relocated to **Semtokha Dzong**, where it functioned until the early 1980s before moving to its present campus above the Dzong.

#### 1989 — Academic Reform
The institute underwent its first major curriculum revision, was upgraded to **Rigzhung College**, and admitted female students for the first time.

#### 1997–1999 — National Milestones
Renamed the **Institute of Language and Culture Studies** in 1997, the College launched Bhutan’s first fully homegrown Bachelor’s Degree Programme in Language and Culture in 1999.

#### 2004 — Royal University of Bhutan
On **28 April 2004**, CLCS became the first tertiary institution formally incorporated under the **Royal University of Bhutan**.

#### 2011 — ILCS was shifted to Trongsa, Taktse
Following its 2011 relocation to **Taktse, Trongsa**, the College of Language and Culture Studies has undergone a significant transformation to align with national development priorities.

### Academic Impact and National Contribution

Over the decades, CLCS has produced experts serving across the civil service, education sector, and media, while generating research that enriches Bhutan’s linguistic and cultural heritage.

Beginning in the **Fall Semester of 2026**, CLCS will introduce five new academic programmes, reinforcing its commitment to innovation, interdisciplinary learning, and the safeguarding of Bhutan’s cultural legacy.`,
        lastUpdated: "2026-05-28"
      },
      {
        id: 'about-vision',
        slug: 'vision-mission',
        title: 'Vision, Mission, and Values',
        category: 'about',
        content: `### Inspiring Generations, Anchored in Heritage

#### Our Vision
To be a prestigious, world-class institution of higher learning in Bhutanese language, cultural heritage, and contemporary socio-humanities; fostering mindfulness, creative expression, and rigorous scholarship dedicated to GNH.

#### Our Mission
1. **Promote Language & Preservation**: Lead research and educational excellence in Dzongkha, culture, art, religion, and the rich heritage of the Kingdom of Bhutan.
2. **Global Integration**: Engage in multi-disciplinary research, linking Bhutanese intellectual heritage with contemporary sciences, global studies, and sustainable innovations.
3. **Values-Led Leadership**: Graduate compassionate, ethically grounded citizens imbued with the philosophy of Gross National Happiness and mindful responsibility.

#### Core Values
- **Ley Jm-Drey (ལས་རྒྱུ་འབྲས།)**: Integrity and cause-and-effect accountability in actions.
- **Thag-Dam-Tse (མཐུན་ལམ་དམ་ཚིག།)**: Utmost fidelity and harmony within our college community and country.
- **Academic Rigour**: Tireless commitment to scientific inquiry, intellectual inquiry, and critical thinking.
- **Mindfulness (Sampa)**: Cultivating calm awareness and GNH values in everyday academic life.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'about-history',
        slug: 'history',
        title: 'College History',
        category: 'about',
        content: `### From Semtokha to Taktse: Our Journey

The history of the College of Language and Culture Studies (Taktse, Trongsa) is deeply intertwined with the educational history of modern Bhutan.

#### Origin as Semtokha Rigzhung
The institution traced its origin back to **Semtokha Rigzhung School**, established in **July 1961** by the third King, His Majesty Jigme Dorji Wangchuck, under the spiritual guidance of the esteemed scholar Dilgo Khyentse Rinpoche. The initial mandate was to teach Dzongkha, classical languages, and traditional philosophies to young Bhutanese.

#### Elevation to College Status
In 1997, Semtokha Rigzhung was converted into the **Rigzhung Institute** under the Ministry of Education. With the birth of the **Royal University of Bhutan** in **2003**, the institute became one of the founding constituent colleges.

#### Relocation to Taktse, Trongsa
To expand Its horizons and provide state-of-the-art facilities, the college relocated from Semtokha (Thimphu) to its present beautiful campus in **Taktse, Trongsa** in **2005**. The tranquil valleys of Trongsa offer the ultimate retreat for classical studies, allowing students to connect intimately with the historic core of the country.

Today, the college has renamed itself **Trongsa College of Heritage and Contemporary Studies**, expanding its spectrum beyond traditional languages into psychology, cultural entrepreneurship, history, and global matters.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'about-staff-profiles',
        slug: 'staff-profiles',
        title: 'Staff Profiles',
        category: 'about',
        content: `Meet the college staff serving students, academic programmes, research, and campus operations. Profile cards below are managed from the admin Staff Profiles tab.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'about-board-of-trustees',
        slug: 'board-of-trustees',
        title: 'Board of Trustees',
        category: 'about',
        content: `### College Governance

The Board of Trustees supports the college through governance, oversight, and strategic direction.

Update this page from the admin Pages tab with the current board composition, roles, meeting notices, and governance documents approved for publication.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'about-gallery',
        slug: 'about-gallery',
        title: 'Gallery',
        category: 'about',
        content: `Explore published college photographs from campus life, culture, and events. Photos below are managed from the admin Photo Gallery Library tab.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'admissions-information',
        slug: 'admission-information',
        title: 'Admission Information',
        category: 'admissions',
        content: `### Admission Guide

Your journey with the College of Language and Culture Studies begins here.

Please read the instructions carefully and ensure you meet all requirements before starting your application.

#### 👤 Who Can Apply?
- Graduates of Class XII meeting eligibility criteria.
- Students with a strong commitment to a four-year programme.
- Applicants who have thoroughly reviewed our five core programmes.

#### 📅 When to Apply?
Applications follow the official Royal University of Bhutan (RUB) schedule.

> Ensure you are confident in your choice before the deadline announced by RUB.

#### ⚠️ Application Condition
> To ensure academic success, applicants must apply only for the programme in which they have a genuine academic interest.

#### 💰 Funding Options
- **Primary Support:** Royal Government of Bhutan Higher Education Grant (Government Scholarship).
- **Note:** Self-financed options are currently not available.

> **Important:** Please ensure your contact details and guardian information are accurate. Successful submissions will receive a notification followed by a phone call.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'admissions-application-process',
        slug: 'application-process',
        title: 'Application Process',
        category: 'admissions',
        content: `### Application Process

Describe each application step, required documents, deadlines, and where applicants should submit forms.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'admissions-selection-criteria',
        slug: 'selection-criteria',
        title: 'Selection Criteria',
        category: 'admissions',
        content: `### Selection Criteria

Maintain the current academic requirements, merit rules, programme-specific criteria, and selection notices.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'admissions-confirmation',
        slug: 'admission-confirmation',
        title: 'Admission Confirmation',
        category: 'admissions',
        content: `### Admission Confirmation

Publish confirmation instructions, acceptance deadlines, reporting requirements, and enrollment checklists.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-koha-library',
        slug: 'koha-library',
        title: 'Koha Library',
        category: 'academics',
        content: `### Koha Library

Add catalog access guidance, borrowing support, library contacts, and Koha service notices here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-e-library',
        slug: 'e-library',
        title: 'e-Library',
        category: 'academics',
        content: `### e-Library

Add digital resource access notes, database links, reading support, and e-library announcements here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-examination-office',
        slug: 'examination-office',
        title: 'Examination Office',
        category: 'academics',
        content: `### Examination Office

Publish examination notices, office contacts, schedules, forms, and result guidance here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-guidelines',
        slug: 'academic-guidelines',
        title: 'Academic Guidelines',
        category: 'academics',
        content: `### Academic Guidelines

Maintain academic policies, learning guidelines, student responsibilities, and approved reference documents here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-international-programs',
        slug: 'international-programs',
        title: 'International Programs',
        category: 'academics',
        content: `### International Programs

Publish exchange opportunities, collaboration notices, eligibility information, and international contact points here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'academics-convocation-registration',
        slug: 'convocation-registration',
        title: 'Convocation Registration',
        category: 'academics',
        content: `### Convocation Registration

Provide registration dates, graduate checklists, payment notes, dress guidance, and convocation contacts here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-rigzoed-journal',
        slug: 'rigzoed-journal',
        title: 'Rigzoed Journal',
        category: 'research',
        externalUrl: 'https://www.clcs.edu.bt/rigzoed-journal-2/',
        content: `### Rigzoed Journal

Publish journal aims, calls for papers, editorial notes, review guidance, and volume announcements here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-centres',
        slug: 'research-centres',
        title: 'Research Centres',
        category: 'research',
        content: `### Research Centres

Introduce the college research centres, their mandates, contacts, collaborations, and current areas of inquiry here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-buddhist-studies',
        slug: 'research-centre-buddhist-studies',
        title: 'Research Centre for Buddhist Studies',
        category: 'research',
        content: `### Research Centre for Buddhist Studies

The Research Centre for Buddhist Studies supports academic inquiry into Buddhist philosophy, textual traditions, contemplative practice, and Bhutanese spiritual heritage. The centre provides a scholarly platform for research, seminars, publications, and dialogue between academics, practitioners, and cultural knowledge holders.

#### Current Focus Areas

- Buddhist philosophy, ethics, epistemology, and hermeneutics
- Bhutanese religious history, monastic learning, and textual preservation
- Applied Buddhist perspectives on peace, leadership, ecology, and contemporary society`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-bhutan-himalayan-centre',
        slug: 'bhutan-himalayan-research-centre',
        title: 'Bhutan & Himalayan Research Centre',
        category: 'research',
        content: `### Bhutan & Himalayan Research Centre

The Bhutan & Himalayan Research Centre advances interdisciplinary study of Bhutan and the wider Himalayan region through field research, archival work, cultural documentation, and regional collaboration. It serves as a platform for studying communities, landscapes, languages, heritage, and social change across the Himalayas.

#### Current Focus Areas

- Himalayan cultural heritage, oral traditions, sacred geography, and local histories
- Bhutanese society, language, environment, migration, and contemporary transformation
- Collaborative research with communities, universities, archives, and regional partners`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-bhutan-culture-atlas',
        slug: 'bhutan-culture-atlas',
        title: 'Bhutan Culture Atlas',
        category: 'research',
        externalUrl: 'http://www.bhutanculturalatlas.clcs.edu.bt',
        content: `### Bhutan Culture Atlas

Add atlas access notes, project descriptions, contribution guidance, and relevant research links here.`,
        lastUpdated: "2026-05-22"
      },
      {
        id: 'research-policies-guidelines',
        slug: 'research-policies-guidelines',
        title: 'Research Policies & Guidelines',
        category: 'research',
        content: `### Research Policies & Guidelines

Publish research ethics, submission policies, approval guidance, citation requirements, and approved documents here.`,
        lastUpdated: "2026-05-22",
        externalUrl: "https://www.rub.edu.bt/wp-content/uploads/2022/01/research-book.pdf"
      }
    ],
    programmes: [
      {
        id: "prog-1",
        title: "Bachelor of Arts in Language and Heritage Studies",
        slug: "ba-language-heritage-studies",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600", // Heritage culture
        description: "An intensive flagship program focused on the preservation of traditional Bhutanese texts, Dzongkha linguistics, and cultural arts conservation. It equips students with the linguistic aptitude and historical mastery required to act as custodians of Bhutanese heritage.",
        duration: "3 Years (Full-Time)",
        eligibility: "Class XII passed with a minimum of 50% in Dzongkha, and satisfactory scores in three other main academic subjects. Excellent proficiency in written and spoken Dzongkha is highly desirable.",
        level: "Undergraduate",
        downloadUrl: "#"
      },
      {
        id: "prog-2",
        title: "Bachelor of Arts in Bhutan Studies and Global Perspectives",
        slug: "ba-bhutan-studies-global-perspectives",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600", // Global perspective
        description: "A hybrid multi-disciplinary degree combining traditional GNH governance philosophies, Bhutanese native history, and contemporary geopolitical dynamics. Imparts deep understanding of Bhutan's role in the modern world context.",
        duration: "3 Years (Full-Time)",
        eligibility: "Class XII passed with 55% aggregate, including English and four relevant humanities subjects.",
        level: "Undergraduate",
        downloadUrl: "#"
      },
      {
        id: "prog-3",
        title: "Bachelor of Arts in Cultural Innovation and Entrepreneurship",
        slug: "ba-cultural-innovation-entrepreneurship",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600", // Entrepreneurship
        description: "A breakthrough professional program merging traditional crafts, performing arts, and heritage assets with modern digital marketing, startup mechanics, tour-agency structures, and sustainable cultural tourism innovations.",
        duration: "3 Years (Full-Time)",
        eligibility: "Class XII passed from any stream with 50% aggregate and passing grade in English.",
        level: "Undergraduate",
        downloadUrl: "#"
      },
      {
        id: "prog-4",
        title: "Bachelor of Arts in History and Global Affairs",
        slug: "ba-history-global-affairs",
        image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=600", // History
        description: "Explore world civilizations, East-Asian history, international relations, and diplomatic strategies. Students analyze historical shifts while building critical debate and international policy expertise standard in global service roles.",
        duration: "3 Years (Full-Time)",
        eligibility: "Class XII passed with 55% aggregate in Arts/Humanities streams or equivalent, with strong English writing standards.",
        level: "Undergraduate",
        downloadUrl: "#"
      },
      {
        id: "prog-5",
        title: "Bachelor of Arts in Psychology and Mindfulness Studies",
        slug: "ba-psychology-mindfulness",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600", // Mindfulness Zen
        description: "An innovative, globally unique curriculum blending modern cognitive psychology, therapeutic sciences, and neurobiology with ancient Bhutanese mindfulness meditative systems, emotional regulation, and GNH wellness styles.",
        duration: "4 Years (Full-Time)",
        eligibility: "Class XII passed with a minimum of 50% aggregate score (all streams accepted) with strong competency in written English and personal analytical interview.",
        level: "Undergraduate",
        downloadUrl: "#"
      }
    ],
    announcements: [
      {
        id: "ann-1",
        title: "Admission Requirements and Intake Options for Academic Year 2026",
        category: "Announcements",
        date: "2026-05-18",
        description: "The Trongsa College of Heritage and Contemporary Studies is pleased to announce the official intake list for self-financed and government-sponsored cohorts across all five BA programs for July 2026 registration. Review checklists, physical enrollment dates, and hostel allocation forms here.",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
        pdfUrl: "#",
        status: "active"
      },
      {
        id: "ann-2",
        title: "Tender: Supply and Installation of Server Stack and Koha e-Library Upgrades",
        category: "Tenders",
        date: "2026-05-15",
        description: "Sealed bids are invited from registered ICT firms in Bhutan for the turnkey modernization of Core Datacenter servers, implementation of e-Library cloud portal, and optical-fiber laying across the campus hostels.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
        pdfUrl: "#",
        status: "active"
      },
      {
        id: "ann-3",
        title: "Vacancy Statement: Part-time Assistant Professor in Mindfulness Cognitive Science",
        category: "Job Vacancies",
        date: "2026-05-10",
        description: "The Department of Psychology invites applications for a core lecturer/professor position. Ideal candidates will possess a post-graduate qualification (Ph.D. preferred) matching modern experimental psych with meditative disciplines.",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=600",
        pdfUrl: "#",
        status: "active"
      }
    ],
    newsEvents: [
      {
        id: "ne-1",
        title: "Interactive Cultural Design Lab Grand Opening",
        date: "2026-05-20",
        description: "Trongsa College inaugurated the first 'Cultural Innovation Lab' with funding from the Royal University. The lab provides advanced wood/clay/weaving prototype tooling and VR workstations to let students digitize traditional Bhutanese architectural assets.",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
        tags: ["Inauguration", "Cultural Innovation", "Tech Lab"]
      },
      {
        id: "ne-2",
        title: "Sem-Drey Meditative Retreat Hosted for International Delegates",
        date: "2026-05-12",
        description: "The Psychology & Mindfulness Department hosted the annual East-West mental wellness forum at CLCS. Over 45 delegates from 12 countries walked through empirical neural studies proving the effectiveness of Bhutanese monastic concentration methods.",
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600",
        tags: ["Global Retreat", "Mindfulness", "Colloquium"]
      }
    ],
    staffProfiles: [
      {
        id: "st-1",
        name: "Dr. Sonam Tobgay",
        profileType: "staff",
        designation: "College President / Vice-Chair of Senate",
        department: "Executive Council",
        email: "sonam.tobgay@rub.edu.bt",
        phone: "+975-03-521151",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
        bio: "Doctor of Linguistics from the University of London. Serves as current academic overseer of CLCS and advisor to Bhutan Ministry of Education on traditional curricula.",
        order: 1
      },
      {
        id: "st-2",
        name: "Lopon Jigme Wangdi",
        profileType: "faculty",
        designation: "Executive Dean of Dzongkha and Cultural Studies",
        department: "Department of Language Studies",
        email: "jigme.wangdi@rub.edu.bt",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
        bio: "Senior Chokay and Dzongkha scriptural scholar. Directs translation audits for historical thangkas and scriptural repositories.",
        order: 2
      },
      {
        id: "st-3",
        name: "Mrs. Dechen Peldon",
        profileType: "faculty",
        designation: "Senior Head of Research & Rigzoed Editorial Board",
        department: "Research and Innovation Hub",
        email: "dechen.peldon@rub.edu.bt",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        bio: "PhD researcher specializing in Himalayan cultural adaptation and rural heritage economic development models. Author of numerous Rigzoed publications.",
        order: 3
      }
    ],
    researchPublications: [
      {
        id: "pub-1",
        title: "Dzongkha Phonology Patterns: A Computational Mapping of Regional Valleys",
        author: "Lopon Jigme Wangdi & Mrs. Dechen Peldon",
        journalName: "Rigzoed Journal of Cultural Researches",
        year: "2025",
        description: "An empirical mapping explaining phonetic variations across the eastern and western dzongkhags, analyzing modern phonetic shift trends among urban school cohorts.",
        pdfUrl: "#",
        externalLink: "#"
      },
      {
        id: "pub-2",
        title: "Integrative Mindfulness in Contemporary Schools: Appreciating Mind-Relief (Sem-Drey) Traditions",
        author: "Mrs. Dechen Peldon",
        journalName: "RUB Journal of Bhutanese Studies",
        year: "2024",
        description: "A comprehensive analysis measuring academic productivity increases inside schools adopting morning traditional breathing routines.",
        pdfUrl: "#",
        externalLink: "#"
      }
    ],
    gallery: [
      { id: "g-1", title: "Majestic Mountain Side School Compound at Taktse", category: "Campus", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" },
      { id: "g-2", title: "Students In Traditional Gho & Kira Doing Debate Session", category: "Events", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800" },
      { id: "g-3", title: "Traditional Handloomed Arts Lab Showcase", category: "Culture", imageUrl: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&q=80&w=800" },
      { id: "g-4", title: "Mindfulness Center Garden Zen Walkway", category: "Campus", imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" }
    ],
    studentServices: [
      {
        id: "serv-1",
        slug: "campus-life",
        title: "Campus Life & Hostels",
        description: "Comfortable residential hostels overlooking the deep gorges of Trongsa, offering wholesome student environments.",
        icon: "Home",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600",
        content: `### Living in the lap of culture
Accommodation is fully boarding with separate modern hostels for male and female undergraduate student cohorts. Standard meals are provided at the central college canteen mess three times daily under hygienic standards managed by the Student Parliament Welfare Comittee. 

Students engage in morning prayers (Rig-Zhey) and evening traditional walks, making dorm life an absolute learning sanctuary.`
      },
      {
        id: "serv-2",
        slug: "it-lab",
        title: "Advanced IT Labs",
        description: "Fully connected computational hubs running optical fiber links to assist with cultural atlas mappings and coding.",
        icon: "Cpu",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600",
        content: `### Computational Excellence for Humanistic Arts
We challenge the misconception that culture studies do not need high technology. Inside our dynamic IT lab, we support digital humanities. 

Students use high-spec computers to record dialects, draft digital atlas archives, coordinate GIS mappings, and design websites to support cultural ventures.`
      },
      {
        id: "serv-3",
        slug: "sports-and-games",
        title: "Traditional Sports & Games Center",
        description: "Enjoy national Bhutanese archery, Khuru (darts), alongside classic football, volleyball, and modern basketball yards.",
        icon: "Award",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600",
        content: `### Body & Mind Alignment
Aligned with Bhutanese philosophies of healthy communal bonding, Trongsa College maintains prime soccer and basketball yards. Archery, the legendary national sport of Bhutan, is actively integrated during major seasonal college competitions (Tsechus).`
      },
      { id: "serv-language-centre", slug: "language-centre", title: "Language Centre", description: "Language learning support, writing guidance, and resources for Dzongkha and academic communication.", icon: "Languages", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600", content: "### Language Centre\nUpdate tutoring hours, resources, workshops, and language support contacts here." },
      { id: "serv-culture", slug: "culture", title: "Culture", description: "Student cultural life, heritage activities, performances, and college traditions.", icon: "Drama", image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600", content: "### Culture\nPublish cultural events, student participation notes, heritage programmes, and tradition-focused activities here." },
      { id: "serv-mess", slug: "mess", title: "Mess", description: "Dining service notices, meal routines, welfare contacts, and mess committee updates.", icon: "Utensils", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600", content: "### Mess\nMaintain meal schedules, dietary notices, feedback channels, and service updates here." },
      { id: "serv-student-clubs", slug: "student-clubs", title: "Student Clubs", description: "Overview of student clubs, club registration, leadership, and activity notices.", icon: "Users", image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&q=80&w=600", content: "### Student Clubs\nIntroduce active clubs, participation guidance, club leaders, and activity calendars here." },
      { id: "serv-dzongkha-literature", slug: "dzongkha-literature", title: "Dzongkha Literature", description: "Club space for Dzongkha reading, literary discussion, writing, and recitation.", icon: "BookOpen", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=600", content: "### Dzongkha Literature\nPublish club meetings, reading selections, writing activities, and student literary work here." },
      { id: "serv-media-club", slug: "media-club", title: "Media Club", description: "Student media production, photography, reporting, and communications activities.", icon: "Camera", image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=600", content: "### Media Club\nUpdate projects, coverage requests, media training, and club contact details here." },
      { id: "serv-clean-bhutan", slug: "clean-bhutan", title: "Clean Bhutan", description: "Campus cleanliness, sustainability campaigns, and volunteer service initiatives.", icon: "Leaf", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600", content: "### Clean Bhutan\nShare cleanup drives, environmental campaigns, volunteer signups, and sustainability notices here." },
      { id: "serv-karate-taekwondo", slug: "karate-taekwondo", title: "Karate / Taekwondo", description: "Martial arts training, practice schedules, competitions, and student fitness updates.", icon: "Swords", image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=600", content: "### Karate / Taekwondo\nMaintain training schedules, coach contacts, safety guidance, and competition news here." },
      { id: "serv-rovers", slug: "rovers", title: "Rovers", description: "Rovers service, leadership, outdoor learning, and community engagement.", icon: "Tent", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600", content: "### Rovers\nPublish rover activities, service projects, camps, and student leadership updates here." },
      { id: "serv-student-associations", slug: "student-associations", title: "Student Associations", description: "Association representation, student leadership, and membership information.", icon: "Handshake", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600", content: "### Student Associations\nMaintain association roles, contacts, election notices, and student representation updates here." },
      { id: "serv-student-centre", slug: "student-centre", title: "Student Centre", description: "Student centre facilities, help desks, activity spaces, and support information.", icon: "Building", image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&q=80&w=600", content: "### Student Centre\nPublish facility access, student support desks, room use, and activity notices here." },
      { id: "serv-counseling-services", slug: "counseling-services", title: "Counseling Services", description: "Confidential student counseling, wellbeing guidance, and support contacts.", icon: "HeartHandshake", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600", content: "### Counseling Services\nMaintain appointment guidance, wellbeing resources, emergency contacts, and support availability here." },
      { id: "serv-accommodation", slug: "accommodation", title: "Accommodation", description: "Hostel allocation, residential rules, room support, and accommodation notices.", icon: "Bed", image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600", content: "### Accommodation\nUpdate hostel allocation guidance, residential contacts, facilities, and room support procedures here." },
      { id: "serv-student-parliament", slug: "student-parliament", title: "Student Parliament", description: "Student parliament representation, meetings, welfare work, and notices.", icon: "Landmark", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600", content: "### Student Parliament\nPublish office bearers, meeting notices, welfare initiatives, and student resolutions here." },
      { id: "serv-student-handbook", slug: "student-handbook", title: "Student Handbook", description: "Handbook guidance, student responsibilities, policies, and resource links.", icon: "Notebook", image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=600", content: "### Student Handbook\nMaintain handbook summaries, approved download links, policy reminders, and student guidance here." },
      { id: "serv-discipline", slug: "discipline", title: "Discipline", description: "Discipline procedures, conduct expectations, reporting channels, and support.", icon: "ShieldCheck", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600", content: "### Discipline\nPublish conduct expectations, discipline processes, reporting guidance, and approved policy references here." }
    ],
    downloads: [
      { id: "d-1", title: "College Academic Calendar 2026-2027", category: "academic-calendar", fileUrl: "#", fileSize: "1.4 MB", dateAdded: "2026-05-12" },
      { id: "d-2", title: "Admissions & Intake Application Guide", category: "admission-forms", fileUrl: "#", fileSize: "850 KB", dateAdded: "2026-05-18" },
      { id: "d-3", title: "Rigzoed Journal Paper Submission Format Template", category: "research-forms", fileUrl: "#", fileSize: "320 KB", dateAdded: "2026-04-15" },
      { id: "d-4", title: "Annual Student Handbook & Honor Code", category: "student-handbook", fileUrl: "#", fileSize: "3.1 MB", dateAdded: "2026-05-01" }
    ]
  };

  ensureDirectoryExistence(DB_FILE);
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  cachedDb = defaultDb;
  return cachedDb;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDirectoryExistence(DB_FILE);
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  cachedDb = data;
}
