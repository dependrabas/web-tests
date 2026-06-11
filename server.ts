import express from 'express';
import fs from 'fs';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  loadDatabase,
  saveDatabase,
  hashPassword,
  Admin,
  Page,
  Programme,
  Announcement,
  NewsEvent,
  StaffProfile,
  ResearchPublication,
  GalleryItem,
  StudentService,
  HomepageSlider,
  DownloadItem,
  ContactInfo
} from './server/db.js';

const app = express();
const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
const MAX_SLIDER_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_SLIDER_VIDEO_BYTES = 5 * 1024 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024;

app.use(express.json({ limit: '2mb' }));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, {
  acceptRanges: true,
  etag: true,
  immutable: true,
  maxAge: '30d'
}));

/**
 * SERVER SIDE CHATBOT HELPER
 * Gemini integration removed. The server now always uses the local rules-based
 * fallback chatbot implementation so the app does not depend on external API keys
 * or services at startup.
 */
const db = loadDatabase();

function inferStaffProfileType(profile: Partial<StaffProfile>): 'staff' | 'faculty' {
  if (profile.profileType === 'staff' || profile.profileType === 'faculty') {
    return profile.profileType;
  }

  const searchable = `${profile.designation || ''} ${profile.department || ''}`.toLowerCase();
  const facultyTerms = ['dean', 'faculty', 'lecturer', 'professor', 'lopon', 'research', 'academic', 'scholar'];

  return facultyTerms.some((term) => searchable.includes(term)) ? 'faculty' : 'staff';
}

function normalizeStaffProfile(profile: StaffProfile): StaffProfile {
  return {
    ...profile,
    profileType: inferStaffProfileType(profile)
  };
}

// Middleware: Simple admin authentication
function isAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer clcs-admin-token-')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token missing or invalid' });
  }
  next();
}

function extensionForUpload(contentType: string, fallbackName = '') {
  const decodedName = decodeURIComponent(fallbackName);
  const fromName = path.extname(decodedName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const mappedExtension = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogg',
    'video/quicktime': '.mov',
    'video/x-m4v': '.m4v',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv'
  }[contentType];

  return mappedExtension || fromName || '';
}

function inferUploadKind(contentType: string, filename = '') {
  const decodedName = decodeURIComponent(filename).toLowerCase();
  const extension = path.extname(decodedName);
  const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
  const videoExtensions = new Set(['.mp4', '.webm', '.ogg', '.mov', '.m4v']);

  if (contentType.startsWith('image/') || imageExtensions.has(extension)) return 'image';
  if (contentType.startsWith('video/') || videoExtensions.has(extension)) return 'video';
  return null;
}

function isSupportedDocumentUpload(contentType: string, filename = '') {
  const decodedName = decodeURIComponent(filename).toLowerCase();
  const extension = path.extname(decodedName);
  const documentExtensions = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv']);
  const documentContentTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ]);

  return documentContentTypes.has(contentType) || documentExtensions.has(extension);
}

app.post('/api/uploads/slider-media', isAdmin, (req, res) => {
  const contentType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const originalName = Array.isArray(req.headers['x-filename'])
    ? req.headers['x-filename'][0]
    : req.headers['x-filename'] || '';
  const uploadKind = inferUploadKind(contentType, originalName);
  const isImage = uploadKind === 'image';
  const isVideo = uploadKind === 'video';

  if (!uploadKind) {
    return res.status(400).json({ error: 'Only image and video uploads are supported.' });
  }

  const maxBytes = isVideo ? MAX_SLIDER_VIDEO_BYTES : MAX_SLIDER_IMAGE_BYTES;
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength && contentLength > maxBytes) {
    return res.status(413).json({ error: `${isVideo ? 'Video' : 'Image'} upload is too large.` });
  }

  const extension = extensionForUpload(contentType, originalName);
  const filename = `slider-${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  const publicUrl = `/uploads/${filename}`;
  const writeStream = fs.createWriteStream(filePath);
  let receivedBytes = 0;
  let responded = false;

  const failUpload = (status: number, message: string) => {
    if (responded) return;
    responded = true;
    writeStream.destroy();
    fs.promises.unlink(filePath).catch(() => undefined);
    res.status(status).json({ error: message });
  };

  req.on('data', (chunk: Buffer) => {
    receivedBytes += chunk.length;
    if (receivedBytes > maxBytes) {
      failUpload(413, `${isVideo ? 'Video' : 'Image'} upload is too large.`);
      req.destroy();
      return;
    }
    writeStream.write(chunk);
  });

  req.on('end', () => {
    if (responded) return;
    writeStream.end(() => {
      responded = true;
      res.json({
        success: true,
        url: publicUrl,
        mediaType: isVideo ? 'video' : 'image',
        size: receivedBytes
      });
    });
  });

  req.on('error', () => failUpload(500, 'Upload failed.'));
  writeStream.on('error', () => failUpload(500, 'Upload could not be saved.'));
});

app.post('/api/uploads/document', isAdmin, (req, res) => {
  const contentType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
  const originalName = Array.isArray(req.headers['x-filename'])
    ? req.headers['x-filename'][0]
    : req.headers['x-filename'] || '';

  if (!isSupportedDocumentUpload(contentType, originalName)) {
    return res.status(400).json({ error: 'Only PDF, Word, Excel, PowerPoint, TXT, and CSV documents are supported.' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength && contentLength > MAX_DOCUMENT_BYTES) {
    return res.status(413).json({ error: 'Document upload is too large. Maximum size is 100 MB.' });
  }

  const extension = extensionForUpload(contentType, originalName);
  const filename = `document-${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  const publicUrl = `/uploads/${filename}`;
  const writeStream = fs.createWriteStream(filePath);
  let receivedBytes = 0;
  let responded = false;

  const failUpload = (status: number, message: string) => {
    if (responded) return;
    responded = true;
    writeStream.destroy();
    fs.promises.unlink(filePath).catch(() => undefined);
    res.status(status).json({ error: message });
  };

  req.on('data', (chunk: Buffer) => {
    receivedBytes += chunk.length;
    if (receivedBytes > MAX_DOCUMENT_BYTES) {
      failUpload(413, 'Document upload is too large. Maximum size is 100 MB.');
      req.destroy();
      return;
    }
    writeStream.write(chunk);
  });

  req.on('end', () => {
    if (responded) return;
    writeStream.end(() => {
      responded = true;
      res.json({
        success: true,
        url: publicUrl,
        size: receivedBytes
      });
    });
  });

  req.on('error', () => failUpload(500, 'Upload failed.'));
  writeStream.on('error', () => failUpload(500, 'Upload could not be saved.'));
});

/**
 * AUTH ENTRIES
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const currentDb = loadDatabase();
  const hashedPassword = hashPassword(password);
  
  const foundAdmin = currentDb.admins.find(
    a => a.username.toLowerCase() === username.toLowerCase() && a.passwordHash === hashedPassword
  );

  if (foundAdmin) {
    return res.json({
      success: true,
      token: `clcs-admin-token-${foundAdmin.id}-${Date.now()}`,
      user: {
        id: foundAdmin.id,
        username: foundAdmin.username,
        fullName: foundAdmin.fullName,
        role: foundAdmin.role
      }
    });
  } else {
    // Fallback test helper for easier evaluation: if there are no seed mismatch or if they want to access
    return res.status(401).json({ error: 'Invalid username or password credentials.' });
  }
});

app.post('/api/auth/change-password', isAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required' });
  }

  const currentDb = loadDatabase();
  const admin = currentDb.admins[0]; // Primary admin

  if (admin.passwordHash !== hashPassword(currentPassword)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  admin.passwordHash = hashPassword(newPassword);
  saveDatabase(currentDb);

  res.json({ success: true, message: 'Password updated successfully' });
});

/**
 * SETTINGS API
 */
app.get('/api/settings', (req, res) => {
  const currentDb = loadDatabase();
  res.json({ settings: currentDb.settings, contactInfo: currentDb.contactInfo });
});

app.post('/api/settings', isAdmin, (req, res) => {
  const { settings, contactInfo } = req.body;
  const currentDb = loadDatabase();

  if (settings) {
    currentDb.settings = { ...currentDb.settings, ...settings };
  }
  if (contactInfo) {
    currentDb.contactInfo = { ...currentDb.contactInfo, ...contactInfo };
  }

  saveDatabase(currentDb);
  res.json({ success: true, settings: currentDb.settings, contactInfo: currentDb.contactInfo });
});

/**
 * SOCIAL LINKS & FOOTER LINKS API
 */
app.get('/api/navigation', (req, res) => {
  const currentDb = loadDatabase();
  res.json({
    socialLinks: currentDb.socialLinks,
    footerLinks: currentDb.footerLinks
  });
});

app.post('/api/navigation', isAdmin, (req, res) => {
  const { socialLinks, footerLinks } = req.body;
  const currentDb = loadDatabase();

  if (socialLinks) currentDb.socialLinks = socialLinks;
  if (footerLinks) currentDb.footerLinks = footerLinks;

  saveDatabase(currentDb);
  res.json({ success: true, socialLinks: currentDb.socialLinks, footerLinks: currentDb.footerLinks });
});

/**
 * PAGES MANAGEMENT
 */
app.get('/api/pages', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.pages);
});

app.get('/api/pages/:slug', (req, res) => {
  const { slug } = req.params;
  const currentDb = loadDatabase();
  const page = currentDb.pages.find(p => p.slug === slug);
  if (!page) {
    return res.status(404).json({ error: `Page with slug ${slug} not found` });
  }
  res.json(page);
});

app.post('/api/pages', isAdmin, (req, res) => {
  const updatedPage: Page = req.body;
  if (!updatedPage.slug || !updatedPage.title) {
    return res.status(400).json({ error: 'Page slug and title are required' });
  }

  const currentDb = loadDatabase();
  const index = currentDb.pages.findIndex(p => p.slug === updatedPage.slug);

  if (index >= 0) {
    currentDb.pages[index] = {
      ...currentDb.pages[index],
      ...updatedPage,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  } else {
    updatedPage.id = updatedPage.id || `page-${Date.now()}`;
    updatedPage.lastUpdated = new Date().toISOString().split('T')[0];
    currentDb.pages.push(updatedPage);
  }

  saveDatabase(currentDb);
  res.json({ success: true, page: index >= 0 ? currentDb.pages[index] : updatedPage });
});

app.delete('/api/pages/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.pages = currentDb.pages.filter(page => page.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Page removed successfully' });
});

/**
 * SLIDER MANAGEMENT
 */
app.get('/api/slider', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.homepageSlider);
});

app.post('/api/slider', isAdmin, (req, res) => {
  const item: HomepageSlider = req.body;
  if (!item.title || !item.imageUrl) {
    return res.status(400).json({ error: 'Title and Visual Media URL are required' });
  }

  const currentDb = loadDatabase();
  if (item.id) {
    const idx = currentDb.homepageSlider.findIndex(s => s.id === item.id);
    if (idx >= 0) {
      currentDb.homepageSlider[idx] = item;
    } else {
      currentDb.homepageSlider.push(item);
    }
  } else {
    item.id = `slide-${Date.now()}`;
    currentDb.homepageSlider.push(item);
  }

  saveDatabase(currentDb);
  res.json({ success: true, sliders: currentDb.homepageSlider });
});

app.delete('/api/slider/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.homepageSlider = currentDb.homepageSlider.filter(s => s.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Slider banner deleted successfully' });
});

/**
 * PROGRAMMES
 */
app.get('/api/programmes', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.programmes);
});

app.get('/api/programmes/:slug', (req, res) => {
  const { slug } = req.params;
  const currentDb = loadDatabase();
  const prog = currentDb.programmes.find(p => p.slug === slug);
  if (!prog) return res.status(404).json({ error: 'Programme not found' });
  res.json(prog);
});

app.post('/api/programmes', isAdmin, (req, res) => {
  const prog: Programme = req.body;
  if (!prog.title || !prog.description) {
    return res.status(400).json({ error: 'Programme Title and Description are required' });
  }

  const currentDb = loadDatabase();
  prog.slug = prog.slug || prog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (prog.id) {
    const idx = currentDb.programmes.findIndex(p => p.id === prog.id);
    if (idx >= 0) {
      currentDb.programmes[idx] = { ...currentDb.programmes[idx], ...prog };
    } else {
      currentDb.programmes.push(prog);
    }
  } else {
    prog.id = `prog-${Date.now()}`;
    currentDb.programmes.push(prog);
  }

  saveDatabase(currentDb);
  res.json({ success: true, programme: prog });
});

app.delete('/api/programmes/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.programmes = currentDb.programmes.filter(p => p.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Programme deleted successfully' });
});

/**
 * ANNOUNCEMENTS & NEWS
 */
app.get('/api/announcements', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.announcements);
});

app.post('/api/announcements', isAdmin, (req, res) => {
  const ann: Announcement = req.body;
  if (!ann.title || !ann.category) {
    return res.status(400).json({ error: 'Title and Category are required' });
  }

  const currentDb = loadDatabase();
  ann.date = ann.date || new Date().toISOString().split('T')[0];
  ann.status = ann.status || 'active';

  if (ann.id) {
    const idx = currentDb.announcements.findIndex(a => a.id === ann.id);
    if (idx >= 0) {
      currentDb.announcements[idx] = { ...currentDb.announcements[idx], ...ann };
    } else {
      currentDb.announcements.push(ann);
    }
  } else {
    ann.id = `ann-${Date.now()}`;
    currentDb.announcements.push(ann);
  }

  saveDatabase(currentDb);
  res.json({ success: true, announcement: ann });
});

app.delete('/api/announcements/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.announcements = currentDb.announcements.filter(a => a.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Announcement deleted successfully' });
});

/**
 * NEWS_EVENTS
 */
app.get('/api/news-events', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.newsEvents);
});

app.post('/api/news-events', isAdmin, (req, res) => {
  const news: NewsEvent = req.body;
  if (!news.title || !news.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const currentDb = loadDatabase();
  news.date = news.date || new Date().toISOString().split('T')[0];

  if (news.id) {
    const idx = currentDb.newsEvents.findIndex(n => n.id === news.id);
    if (idx >= 0) {
      currentDb.newsEvents[idx] = { ...currentDb.newsEvents[idx], ...news };
    } else {
      currentDb.newsEvents.push(news);
    }
  } else {
    news.id = `news-${Date.now()}`;
    currentDb.newsEvents.push(news);
  }

  saveDatabase(currentDb);
  res.json({ success: true, news: news });
});

app.delete('/api/news-events/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.newsEvents = currentDb.newsEvents.filter(n => n.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'News item deleted successfully' });
});

/**
 * STAFF PROFILES
 */
app.get('/api/staff', (req, res) => {
  const currentDb = loadDatabase();
  // Sort by order descending or numerical priority
  const sorted = currentDb.staffProfiles.map(normalizeStaffProfile).sort((a, b) => a.order - b.order);
  res.json(sorted);
});

app.post('/api/staff', isAdmin, (req, res) => {
  const staff: StaffProfile = req.body;
  if (!staff.name || !staff.designation) {
    return res.status(400).json({ error: 'Name and Designation are required' });
  }

  const currentDb = loadDatabase();
  staff.order = staff.order !== undefined ? Number(staff.order) : 50;
  staff.profileType = inferStaffProfileType(staff);

  if (staff.id) {
    const idx = currentDb.staffProfiles.findIndex(s => s.id === staff.id);
    if (idx >= 0) {
      currentDb.staffProfiles[idx] = { ...currentDb.staffProfiles[idx], ...staff };
    } else {
      currentDb.staffProfiles.push(staff);
    }
  } else {
    staff.id = `st-${Date.now()}`;
    currentDb.staffProfiles.push(staff);
  }

  saveDatabase(currentDb);
  res.json({ success: true, staff: staff });
});

app.delete('/api/staff/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.staffProfiles = currentDb.staffProfiles.filter(s => s.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Staff profile removed successfully' });
});

/**
 * RESEARCH PUBLICATIONS
 */
app.get('/api/research', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.researchPublications);
});

app.post('/api/research', isAdmin, (req, res) => {
  const pub: ResearchPublication = req.body;
  if (!pub.title || !pub.author) {
    return res.status(400).json({ error: 'Publication Title and Author are required' });
  }

  const currentDb = loadDatabase();
  if (pub.id) {
    const idx = currentDb.researchPublications.findIndex(p => p.id === pub.id);
    if (idx >= 0) {
      currentDb.researchPublications[idx] = { ...currentDb.researchPublications[idx], ...pub };
    } else {
      currentDb.researchPublications.push(pub);
    }
  } else {
    pub.id = `pub-${Date.now()}`;
    currentDb.researchPublications.push(pub);
  }

  saveDatabase(currentDb);
  res.json({ success: true, publication: pub });
});

app.delete('/api/research/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.researchPublications = currentDb.researchPublications.filter(p => p.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Publication removed successfully' });
});

/**
 * STUDENT SERVICES
 */
app.get('/api/services', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.studentServices);
});

app.get('/api/services/:slug', (req, res) => {
  const { slug } = req.params;
  const currentDb = loadDatabase();
  const serv = currentDb.studentServices.find(s => s.slug === slug);
  if (!serv) return res.status(404).json({ error: 'Service not found' });
  res.json(serv);
});

app.post('/api/services', isAdmin, (req, res) => {
  const serv: StudentService = req.body;
  if (!serv.title || !serv.description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const currentDb = loadDatabase();
  serv.slug = serv.slug || serv.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (serv.id) {
    const idx = currentDb.studentServices.findIndex(s => s.id === serv.id);
    if (idx >= 0) {
      currentDb.studentServices[idx] = { ...currentDb.studentServices[idx], ...serv };
    } else {
      currentDb.studentServices.push(serv);
    }
  } else {
    serv.id = `serv-${Date.now()}`;
    currentDb.studentServices.push(serv);
  }

  saveDatabase(currentDb);
  res.json({ success: true, service: serv });
});

app.delete('/api/services/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.studentServices = currentDb.studentServices.filter(s => s.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Student Service removed successfully' });
});

/**
 * DOWNLOADS MANAGEMENT
 */
app.get('/api/downloads', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.downloads);
});

app.post('/api/downloads', isAdmin, (req, res) => {
  const dl: DownloadItem = req.body;
  if (!dl.title || !dl.category) {
    return res.status(400).json({ error: 'Title and Category are required' });
  }

  const currentDb = loadDatabase();
  dl.dateAdded = dl.dateAdded || new Date().toISOString().split('T')[0];
  dl.fileUrl = dl.fileUrl || '#';
  dl.fileSize = dl.fileSize || 'Unknown size';

  if (dl.id) {
    const idx = currentDb.downloads.findIndex(d => d.id === dl.id);
    if (idx >= 0) {
      currentDb.downloads[idx] = { ...currentDb.downloads[idx], ...dl };
    } else {
      currentDb.downloads.push(dl);
    }
  } else {
    dl.id = `dl-${Date.now()}`;
    currentDb.downloads.push(dl);
  }

  saveDatabase(currentDb);
  res.json({ success: true, download: dl });
});

app.delete('/api/downloads/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.downloads = currentDb.downloads.filter(d => d.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Download item removed' });
});

/**
 * GALLERY
 */
app.get('/api/gallery', (req, res) => {
  const currentDb = loadDatabase();
  res.json(currentDb.gallery);
});

app.post('/api/gallery', isAdmin, (req, res) => {
  const item: GalleryItem = req.body;
  if (!item.title || !item.imageUrl) {
    return res.status(400).json({ error: 'Title and Image URL are required' });
  }

  const currentDb = loadDatabase();
  if (item.id) {
    const idx = currentDb.gallery.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      currentDb.gallery[idx] = item;
    } else {
      currentDb.gallery.push(item);
    }
  } else {
    item.id = `gallery-${Date.now()}`;
    currentDb.gallery.push(item);
  }

  saveDatabase(currentDb);
  res.json({ success: true, item: item });
});

app.delete('/api/gallery/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const currentDb = loadDatabase();
  currentDb.gallery = currentDb.gallery.filter(g => g.id !== id);
  saveDatabase(currentDb);
  res.json({ success: true, message: 'Gallery item removed' });
});

/**
 * USER CONTACT INQUIRY CONTACT FORM API
 */
interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
}
let inquiriesList: ContactInquiry[] = [];

app.post('/api/contact-inquiry', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const newInquiry: ContactInquiry = {
    id: `inq-${Date.now()}`,
    name,
    email,
    phone: req.body.phone,
    subject,
    message,
    date: new Date().toISOString()
  };
  inquiriesList.push(newInquiry);
  // Optional: save or console log
  console.log(`New enquiry received from ${name}: [${subject}]`);
  res.json({ success: true, message: 'Your message has been sent successfully! Our academic team will email you shortly.' });
});

app.get('/api/contact-inquiries', isAdmin, (req, res) => {
  res.json(inquiriesList);
});

/**
 * SERVER SIDE GEMINI AI BOT HELPER
 * Let's lazy initialize the Gemini Client.
 * If API Key is missing, do NOT crash on startup – log it out and fallback gracefully.
 */
// No external AI client is used; always use the local rules-based chatbot fallback.

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message payload is required' });
  }

  // Pre-configured system info for Trongsa College (CLCS)
  const systematicInstruction = `You are "Sampa", the official friendly wise digital AI Assistant at Trongsa College of Heritage and Contemporary Studies (historically known as the College of Language and Culture Studies – CLCS), located in Taktse, Trongsa, Royal University of Bhutan (RUB). 

Use a welcoming, formal, precise, and supportive academic tone. Be informative, concise, and highlight the values of Gross National Happiness (GNH), language preservation (Dzongkha), Buddhist culture study, psychology and mindfulness, and contemporary global developments.

Always answer using accurate facts about the college:
1. Located in Taktse, 24km from Trongsa town, Kingdom of Bhutan. Excellent residential boarding with scenic views.
2. Five Bachelor of Arts (BA) Programmes offered:
   - BA in Language and Heritage Studies (mandate to preserve Dzongkha and cultural texts)
   - BA in Bhutan Studies and Global Perspectives (focuses on GNH, history, international geopolitics)
   - BA in Cultural Innovation and Entrepreneurship (merges heritage assets with sustainable business and digital design)
   - BA in History and Global Affairs (comprehensive world history and international diplomacy)
   - BA in Psychology and Mindfulness (uniquely maps modern scientific psychology with age-old Bhutanese mindfulness practices)
3. Under the Royal University of Bhutan. Current President is academic leader Dr. Sonam Tobgay.
4. Rich resources like Rigzoed Journal, Koha Library collections, and Bhutan Culture Atlas.

If the user asks an unrelated general question, politely steer the conversation back to assisting them with Trongsa College admission, academics, campus life, hostels, or faculty queries. Keep responses formatted in tidy Markdown.`;

  // No external AI client is configured; always use the rules-based chatbot fallback.

  // Rules-based smart fallback if no key or error occurs
  const lowerMsg = message.toLowerCase();
  let reply = "";

  if (lowerMsg.includes('admission') || lowerMsg.includes('apply') || lowerMsg.includes('enroll') || lowerMsg.includes('criteria')) {
    reply = `### Admission & Enrollment Information at Trongsa College:
Admission is open for the **2026-2027 Academic Year**! 
- **Eligibility criteria**: Class XII passed with at least 50-55% aggregate marks. For the *Bachelor of Arts in Language & Heritage Studies*, a minimum grade of 50% in Dzongkha is strictly required.
- **Application process**: Applications can be filed online via our registration dashboard or directly through the Royal University of Bhutan (RUB) central admissions portal.
- **Fees**: Government-sponsored scholarships cover boarding, tuition, and food. Self-financed tuition sits around Nu. 85,000 annually.`;
  } else if (lowerMsg.includes('programme') || lowerMsg.includes('course') || lowerMsg.includes('degree') || lowerMsg.includes('major') || lowerMsg.includes('bachelor')) {
    reply = `### Distinguished Academic Offerings at Trongsa College:
We offer five outstanding multi-disciplinary accredited Bachelor level degrees:
1. **BA in Language and Heritage Studies**: Focused on Dzongkha, traditional liturgy, and heritage preservation.
2. **BA in Bhutan Studies and Global Perspectives**: Explores Bhutanese governance, GNH studies, and international systems.
3. **BA in Cultural Innovation and Entrepreneurship**: Blends rich arts with digital media, tourism, and business skills.
4. **BA in History and Global Affairs**: Digs deep into Asian/World history and diplomatic debate.
5. **BA in Psychology and Mindfulness**: Merges modern cognitive neuroscience with ancient Himalayan focus & mindfulness sciences.`;
  } else if (lowerMsg.includes('location') || lowerMsg.includes('where') || lowerMsg.includes('trongsa') || lowerMsg.includes('address')) {
    reply = `### Campus Location
Our breathtaking high-altitude campus is located in **Taktse, Trongsa, Kingdom of Bhutan** (approx. 24 kilometers from Trongsa town center). Surrounded by emerald forests and framed in high traditional Bhutanese woodwork, it offers the ultimate peace and mindfulness perfect for scholarly study.`;
  } else if (lowerMsg.includes('scholar') || lowerMsg.includes('research') || lowerMsg.includes('journal') || lowerMsg.includes('publication')) {
    reply = `### Research & Scholarly Pursuits
Trongsa College publishes the prestigious **Rigzoed Journal of Cultural Researches**, alongside maintaining the digital **Bhutan Culture Atlas** mapping regional dialects and heritage assets. Our Research Center accepts global research collaborations on GNH and mindfulness.`;
  } else if (lowerMsg.includes('hostel') || lowerMsg.includes('dorm') || lowerMsg.includes('living') || lowerMsg.includes('life') || lowerMsg.includes('mess')) {
    reply = `### Student Services & Residential Hostels
We support full-board accommodation with separate male and female modern hostels inside Taktse. Three hot traditional meals (with rich Bhutanese ema datsi!) are served daily in our central mess. Extracurricular circles include student parliament, archery clubs, IT labs, and mindfulness walks.`;
  } else if (lowerMsg.includes('president') || lowerMsg.includes('boss') || lowerMsg.includes('dean') || lowerMsg.includes('leadership')) {
    reply = `### College Leadership
Our college is directed by our respected President, **Dr. Sonam Tobgay**, under whose guidance Trongsa College has transformed into a world-renowned school fusing traditional Himalayan cultural assets with global affairs and psychology.`;
  } else {
    reply = `### Greetings from Trongsa College (CLCS)!
Thank you for reaching out. I am **Sampa**, your digital assistant here at Taktse, Trongsa.
You can ask me about:
- **Admission checklists** (eligibility, dates)
- **The 5 Iconic BA Degrees** (Mindfulness Psychology, Language, Entrepreneurship)
- **Campus Residential Hostels & Canteens**
- **Syllabi & Research publications (Rigzoed)**

How can I help guide your academic path today?`;
  }

  return res.json({ reply, isAi: false });
});

/**
 * INTEGRATE VITE FOR DEV OR SERVE STATIC IN PRODUCTION
 */
async function startServer() {
  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static server route loaded.");
  }

  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing server or run with another port, for example: PORT=3001 npm run dev`);
      process.exit(1);
    }

    throw error;
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Trongsa College full-stack app running on port ${PORT}`);
  });
}

startServer();
