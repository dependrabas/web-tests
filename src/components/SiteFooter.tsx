import type React from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube
} from 'lucide-react';
import { CollegeSettings, ContactInfo, FooterLink, SocialLink } from '../types';

interface SiteFooterProps {
  adminActive: boolean;
  contact: ContactInfo;
  footerLinks: FooterLink[];
  onNavigate: (tab: string, slug?: string | null) => void;
  settings: CollegeSettings;
  socialLinks: SocialLink[];
}

const footerCategories: FooterLink['category'][] = ['Web Links', 'Useful Links', 'College Online System'];

const defaultFooterLinks: FooterLink[] = [
  { id: 'default-web-rub', title: 'Royal University of Bhutan', url: 'https://www.rub.edu.bt', category: 'Web Links' },
  { id: 'default-web-cnr', title: 'College of Natural Resources', url: '#', category: 'Web Links' },
  { id: 'default-web-sherubtse', title: 'Sherubtse College', url: '#', category: 'Web Links' },
  { id: 'default-web-cst', title: 'College of Science & Technology', url: '#', category: 'Web Links' },
  { id: 'default-web-pce', title: 'Paro College of Education', url: '#', category: 'Web Links' },
  { id: 'default-web-jnec', title: 'Jigme Namgyal Engineering College', url: '#', category: 'Web Links' },
  { id: 'default-web-sce', title: 'Samtse College of Education', url: '#', category: 'Web Links' },
  { id: 'default-web-gcbs', title: 'Gedu College of Business Studies', url: '#', category: 'Web Links' },
  { id: 'default-web-gcit', title: 'Gyalpozhing College of Information Technology', url: '#', category: 'Web Links' },
  { id: 'default-useful-egp', title: 'eGP - Electronic Government Procurement System', url: '#', category: 'Useful Links' },
  { id: 'default-useful-mofa', title: 'Ministry of Foreign Affairs & External Trade', url: '#', category: 'Useful Links' },
  { id: 'default-useful-edats', title: 'eDATS', url: '#', category: 'Useful Links' },
  { id: 'default-online-rigzoed', title: 'Rigzoed Journal', url: '#', category: 'College Online System' },
  { id: 'default-online-vle', title: 'VLE - Virtual Learning Environment', url: 'https://vle.clcs.edu.bt', category: 'College Online System' },
  { id: 'default-online-ims', title: 'RUB - IMS', url: 'https://ims.rub.edu.bt', category: 'College Online System' },
  { id: 'default-online-koha', title: 'Koha Library', url: '#', category: 'College Online System' },
  { id: 'default-online-ebsco', title: 'EBSCO', url: '#', category: 'College Online System' },
  { id: 'default-online-doaj', title: 'DOAJ', url: 'https://doaj.org', category: 'College Online System' },
  { id: 'default-online-r4l', title: 'Research4Life', url: 'https://www.research4life.org', category: 'College Online System' },
  { id: 'default-online-jstor', title: 'JSTOR', url: 'https://www.jstor.org', category: 'College Online System' },
  { id: 'default-online-mooc', title: 'EIFSTIAT MOOC', url: '#', category: 'College Online System' },
  { id: 'default-online-recms', title: 'RECMS', url: '#', category: 'College Online System' },
  { id: 'default-online-no-due', title: 'No Due System', url: '#', category: 'College Online System' }
];

const socialIconMap: Record<SocialLink['platform'], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube
};

function resolveInternalTarget(url: string) {
  const normalized = url.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized === '#') return null;

  if (normalized.includes(':')) {
    const [tab, slug] = normalized.split(':');
    return { tab, slug: slug || null };
  }

  const [tab, slug] = normalized.split('/');
  return { tab, slug: slug || null };
}

function isExternalUrl(url: string) {
  return /^(https?:|mailto:|tel:)/i.test(url);
}

export default function SiteFooter({ adminActive, contact, footerLinks, onNavigate, settings, socialLinks }: SiteFooterProps) {
  const groupedLinks = footerCategories.map((category) => {
    const links = footerLinks.filter((link) => link.category === category);
    return {
      category,
      links: links.length > 0 ? links : defaultFooterLinks.filter((link) => link.category === category)
    };
  });
  const currentYear = new Date().getFullYear();
  const featuredSocialLinks = socialLinks.length > 0
    ? socialLinks
    : [
      { id: 'default-facebook', platform: 'facebook' as const, url: 'https://facebook.com/clcs.rub' },
      { id: 'default-youtube', platform: 'youtube' as const, url: 'https://youtube.com/c/clcstrongsa' }
    ];

  const handleInternalLink = (url: string) => {
    const target = resolveInternalTarget(url);
    if (target) onNavigate(target.tab, target.slug);
  };

  return (
    <>
      <div className="bhutanese-trim mt-14"></div>
      <footer className="relative overflow-hidden bg-clcs-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,138,42,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(11,35,65,0)_52%,rgba(122,31,43,0.22))]"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-white/25"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)_minmax(18rem,0.95fr)]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {groupedLinks.slice(0, 2).map(({ category, links }) => (
                <LinkColumn key={category} category={category} links={links} onInternalLink={handleInternalLink} />
              ))}
            </div>

            <LinkColumn
              category="College Online System"
              icon={<BookOpen className="h-4 w-4" />}
              links={groupedLinks.find((group) => group.category === 'College Online System')?.links || []}
              onInternalLink={handleInternalLink}
            />

            <div className="space-y-5">
              <div>
                <h5 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
                  <span className="h-8 w-1 rounded-full bg-clcs-gold"></span>
                  Contact Us
                </h5>
                <address className="not-italic">
                  <div className="space-y-3 text-sm text-slate-100">
                    <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                      <p className="mb-2 font-bold text-white">Postal Address:</p>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-clcs-gold" />
                        <span className="leading-6">
                          College of Language and Culture Studies<br />
                          P.O Box No. 554<br />
                          Taktse, Drakten: Trongsa Bhutan.
                        </span>
                      </div>
                    </div>
                    <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-3 rounded-lg border border-white/12 bg-white/10 p-3 transition hover:border-clcs-gold hover:bg-white/15">
                      <Phone className="h-4 w-4 text-clcs-gold" />
                      <span>{contact.phone}</span>
                    </a>
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-3 rounded-lg border border-white/12 bg-white/10 p-3 transition hover:border-clcs-gold hover:bg-white/15">
                      <Mail className="h-4 w-4 shrink-0 text-clcs-gold" />
                      <span className="min-w-0 break-all">{contact.email}</span>
                    </a>
                  </div>
                </address>
              </div>

              <div className="overflow-hidden rounded-lg border border-white/15 bg-white shadow-2xl shadow-[#06213a]/25">
                <iframe
                  title="College location map"
                  src={contact.mapEmbedUrl}
                  className="h-64 w-full border-0 sm:h-72"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-white/15 pt-7 text-sm text-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">College of Language and Culture Studies</p>
              <p className="mt-1 text-xs text-slate-300">
                Copyright © {currentYear} Trongsa College of Heritage and Contemporary Studies
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Follow Us</span>
              {featuredSocialLinks.map((link) => {
                const SocialIcon = socialIconMap[link.platform] || Facebook;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.platform}
                    title={link.platform}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white text-clcs-navy shadow-lg shadow-[#06213a]/10 transition hover:-translate-y-0.5 hover:border-clcs-gold hover:bg-clcs-gold hover:text-[#08172a]"
                  >
                    <SocialIcon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function LinkColumn({
  category,
  icon,
  links,
  onInternalLink
}: {
  category: FooterLink['category'];
  icon?: React.ReactNode;
  links: FooterLink[];
  onInternalLink: (url: string) => void;
}) {
  return (
    <div className="min-w-0">
      <h5 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-white">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/14 text-clcs-gold">
          {icon || <ArrowUpRight className="h-4 w-4" />}
        </span>
        {category}
      </h5>
      {links.length === 0 ? (
        <p className="text-xs leading-6 text-slate-300">No footer links published.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {links.map((link) => (
            <li key={link.id}>
              {isExternalUrl(link.url) ? (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex max-w-full items-start justify-between gap-3 rounded-lg px-2 py-1.5 text-slate-100 transition hover:bg-white/12 hover:text-white"
                >
                  <span className="min-w-0 leading-6">{link.title}</span>
                  <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 opacity-45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              ) : (
                <button
                  onClick={() => onInternalLink(link.url)}
                  className="group flex max-w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-left text-slate-100 transition hover:bg-white/12 hover:text-white"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clcs-gold/85 transition group-hover:bg-clcs-gold"></span>
                  <span className="min-w-0 leading-6">{link.title}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
