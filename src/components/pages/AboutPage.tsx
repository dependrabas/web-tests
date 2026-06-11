import { FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import MarkdownContent from '../MarkdownContent';
import ProfileDirectory from '../ProfileDirectory';
import { GalleryItem, Page, StaffProfile } from '../../types';

interface AboutPageProps {
  currentSlug: string | null;
  onSelectPage: (slug: string) => void;
  pages: Page[];
  staff: StaffProfile[];
  gallery: GalleryItem[];
}

const aboutLinks = [
  { slug: 'overview', label: 'Introduction', title: 'Introduction' },
  { slug: 'vision-mission', label: 'Vision, Mission, and Values', title: 'Vision, Mission, and Values' },
  { slug: 'staff-profiles', label: 'Staff Profiles', title: 'Staff Profiles' },
  { slug: 'board-of-trustees', label: 'Board of Trustees', title: 'Board of Trustees' },
  { slug: 'about-gallery', label: 'Gallery', title: 'Gallery' }
];

export default function AboutPage({ currentSlug, onSelectPage, pages, staff, gallery }: AboutPageProps) {
  const enabledAboutLinks = aboutLinks.filter((item) => {
    const page = pages.find((entry) => entry.slug === item.slug);
    return !page || page.enabled !== false;
  });
  const fallbackLink = enabledAboutLinks[0] || aboutLinks[0];
  const requestedLink = enabledAboutLinks.find((item) => item.slug === currentSlug);
  const activeSlug = requestedLink?.slug || fallbackLink.slug;
  const activeLink = enabledAboutLinks.find((item) => item.slug === activeSlug) || fallbackLink;
  const page = pages.find((entry) => entry.slug === activeSlug);
  const staffProfiles = staff.filter((profile) => (profile.profileType || 'staff') === 'staff');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
      <nav className="clcs-subnav p-3 pl-5 rounded-2xl flex flex-wrap gap-2" aria-label="About section navigation">
          {enabledAboutLinks.map((item) => (
            <motion.button
              key={item.slug}
              onClick={() => onSelectPage(item.slug)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
            >
              {item.label}
            </motion.button>
          ))}
      </nav>

      <section className="clcs-official-panel min-w-0 overflow-hidden rounded-2xl p-5 sm:p-7 md:p-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="space-y-4"
          >
              {activeSlug !== 'staff-profiles' && activeSlug !== 'about-gallery' && page && (
                <>
                  <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="clcs-document-mark h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-3xl">{page.title}</h2>
                    </div>
                  </div>
                  <div className="max-w-none text-slate-700 space-y-3">
                    <MarkdownContent text={page.content} />
                  </div>
                </>
              )}
              {activeSlug !== 'staff-profiles' && activeSlug !== 'about-gallery' && !page && (
                <div className="py-12 text-center">
                  <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-3xl">{activeLink.title}</h2>
                  <p className="mt-3 text-sm text-slate-400">This page is ready, but no published content is available yet.</p>
                </div>
              )}
              {activeSlug === 'staff-profiles' && (
                <div className="space-y-5">
                  {page && (
                    <div className="border-b border-slate-200 pb-5">
                      <div className="mt-3 text-sm text-slate-600">
                        <MarkdownContent text={page.content} />
                      </div>
                    </div>
                  )}
                  <ProfileDirectory
                    emptyText="No staff profiles are published yet."
                    profiles={staffProfiles}
                    title="Our Staff"
                  />
                </div>
              )}
              {activeSlug === 'about-gallery' && (
                <div className="space-y-5">
                  {page && (
                    <div className="border-b border-slate-200 pb-5">
                      <div className="mt-3 text-sm text-slate-600">
                        <MarkdownContent text={page.content} />
                      </div>
                    </div>
                  )}
                  <h4 className="profile-directory-title">
                    Gallery
                  </h4>
                  {gallery.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center">No gallery photos are published yet.</p>
                  ) : (
                    <div className="gallery-grid">
                      {gallery.map((item) => (
                        <figure key={item.id} className="gallery-card">
                          <div className="gallery-card-media">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <figcaption className="gallery-card-caption">
                            <span>{item.category}</span>
                            <p>{item.title}</p>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
