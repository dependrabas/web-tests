import { BookOpenText, Download, Globe2, Map, Microscope, Mountain, ScrollText, UsersRound } from 'lucide-react';
import MarkdownContent from '../MarkdownContent';
import { DownloadItem, NewsEvent, Page } from '../../types';

interface ResearchPageProps {
  currentSlug: string | null;
  downloads: DownloadItem[];
  newsEvents: NewsEvent[];
  onSelectPage: (slug: string | null) => void;
  pages: Page[];
}

const researchLinks = [
  { slug: 'rigzoed-journal', label: 'Rigzoed Journal', fallbackExternalUrl: 'https://www.clcs.edu.bt/rigzoed-journal-2/' },
  { slug: 'bhutan-culture-atlas', label: 'Bhutan Culture Atlas', fallbackExternalUrl: 'http://www.bhutanculturalatlas.clcs.edu.bt' },
  { slug: 'research-policies-guidelines', label: 'Research Policies & Guidelines', fallbackExternalUrl: 'https://www.rub.edu.bt/wp-content/uploads/2022/01/research-book.pdf' }
];

const researchCentreLinks = [
  { slug: 'research-centre-buddhist-studies', label: 'Research Centre for Buddhist Studies' },
  { slug: 'bhutan-himalayan-research-centre', label: 'Bhutan & Himalayan Research Centre' }
];

const buddhistStudyHighlights = [
  {
    title: 'Scholarly Inquiry',
    description: 'Advancing rigorous research into Buddhist philosophy and Bhutanese cultural heritage through academic examination and cross-cultural dialogue.',
    Icon: ScrollText
  },
  {
    title: 'Intellectual Hub',
    description: 'Providing a collaborative space for scholars and practitioners to exchange ideas and contribute to the global Buddhist community.',
    Icon: UsersRound
  },
  {
    title: 'Global Harmony',
    description: 'Fostering peace and harmonious coexistence by examining contemporary global issues through the lens of Buddhist principles.',
    Icon: Globe2
  }
];

const himalayanResearchHighlights = [
  {
    title: 'Himalayan Heritage',
    description: 'Documenting living traditions, sacred landscapes, oral histories, and cultural memory across Bhutan and the wider Himalayan region.',
    Icon: Mountain
  },
  {
    title: 'Field Research',
    description: 'Supporting interdisciplinary fieldwork, archival study, and community-based research that connects local knowledge with academic inquiry.',
    Icon: Map
  },
  {
    title: 'Regional Collaboration',
    description: 'Building partnerships with scholars, institutions, and communities to study shared histories, languages, environments, and cultural practices.',
    Icon: BookOpenText
  }
];

const researchOverviewActions = [
  {
    title: 'Rigzoed Journal',
    description: 'Access the college journal and scholarly publications platform.',
    Icon: BookOpenText,
    href: 'https://journal.clcs.edu.bt/'
  },
  {
    title: 'Research Centres',
    description: 'Explore centre-led research in Buddhist studies and Himalayan heritage.',
    Icon: Microscope,
    slug: 'research-centres'
  },
  {
    title: 'Bhutan Culture Atlas',
    description: 'Visit the digital atlas documenting Bhutanese cultural landscapes.',
    Icon: Map,
    href: 'https://bca.clcs.edu.bt/'
  },
  {
    title: 'Policies & Guidelines',
    description: 'Open the Royal University of Bhutan research policy document.',
    Icon: ScrollText,
    href: 'https://www.rub.edu.bt/wp-content/uploads/2022/01/research-book.pdf'
  }
];

export default function ResearchPage({
  currentSlug,
  downloads,
  newsEvents,
  onSelectPage,
  pages
}: ResearchPageProps) {
  const activeSlug = currentSlug || 'research-overview';
  const page = pages.find((entry) => entry.slug === activeSlug && entry.category === 'research');
  const researchCentresActive = activeSlug === 'research-centres' || researchCentreLinks.some((item) => item.slug === activeSlug);
  const showResearchOverview = activeSlug === 'research-overview';
  const showBuddhistStudiesShowcase = activeSlug === 'research-centre-buddhist-studies';
  const showHimalayanResearchShowcase = activeSlug === 'bhutan-himalayan-research-centre';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
      <nav className="clcs-subnav p-3 pl-5 rounded-2xl flex flex-wrap gap-2" aria-label="Research section navigation">
          {researchLinks.slice(0, 1).map((item) => {
            const linkedPage = pages.find((pageItem) => pageItem.slug === item.slug && pageItem.category === 'research');
            const externalUrl = linkedPage?.externalUrl || item.fallbackExternalUrl;

            return externalUrl ? (
              <a
                key={item.slug}
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.slug}
                onClick={() => onSelectPage(item.slug)}
                className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onSelectPage('research-centres')}
            className={`clcs-subnav-link ${researchCentresActive ? 'is-active' : ''}`}
          >
            Research Centres
          </button>
          {researchLinks.slice(1).map((item) => {
            const linkedPage = pages.find((pageItem) => pageItem.slug === item.slug && pageItem.category === 'research');
            const externalUrl = linkedPage?.externalUrl || item.fallbackExternalUrl;

            return externalUrl ? (
              <a
                key={item.slug}
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.slug}
                onClick={() => onSelectPage(item.slug)}
                className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
      </nav>

      {researchCentresActive && (
        <nav className="clcs-subnav p-3 pl-5 rounded-2xl flex flex-wrap gap-2" aria-label="Research centre navigation">
          {researchCentreLinks.map((item) => {
            const linkedPage = pages.find((pageItem) => pageItem.slug === item.slug && pageItem.category === 'research');

            return (
              <button
                key={item.slug}
                onClick={() => onSelectPage(item.slug)}
                disabled={!linkedPage}
                className={`clcs-subnav-link clcs-subnav-link--secondary ${activeSlug === item.slug ? 'is-active' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="clcs-official-panel p-5 sm:p-7 md:p-8 rounded-2xl space-y-4">
            {showResearchOverview ? (
              <ResearchOverview onSelectPage={onSelectPage} />
            ) : page ? (
              <>
                <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row gap-4">
                  <div className="clcs-document-mark h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] bg-[#f7f4ee] text-[#8a5b00] border border-[#b68a2a]/35 rounded-full px-3 py-1 uppercase font-bold">
                      Updated {page.lastUpdated}
                    </span>
                    <h3 className="font-display font-extrabold text-[#0b2341] text-2xl mt-2 break-words">{page.title}</h3>
                  </div>
                </div>
                <MarkdownContent text={page.content} />
                {showBuddhistStudiesShowcase && (
                  <section className="cbs-showcase mt-7" aria-label="Center for Buddhist Studies focus areas">
                    <div className="cbs-showcase__intro">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a1f2b]">Center for Buddhist Studies</p>
                      <h4 className="font-display text-2xl md:text-3xl font-extrabold text-[#0b2341] mt-2">Advancing Wisdom • Cultivating Peace • Preserving Heritage</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      {buddhistStudyHighlights.map(({ title, description, Icon }, index) => (
                        <article
                          key={title}
                          className="cbs-feature-card"
                          style={{ animationDelay: `${index * 120}ms` }}
                        >
                          <div className="cbs-feature-card__icon" aria-hidden="true">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h5>{title}</h5>
                          <p>{description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {showHimalayanResearchShowcase && (
                  <section className="cbs-showcase mt-7" aria-label="Bhutan and Himalayan Research Centre focus areas">
                    <div className="cbs-showcase__intro">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a1f2b]">Bhutan & Himalayan Research Centre</p>
                      <h4 className="font-display text-2xl md:text-3xl font-extrabold text-[#0b2341] mt-2">Studying Place • Sustaining Memory • Connecting Regions</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      {himalayanResearchHighlights.map(({ title, description, Icon }, index) => (
                        <article
                          key={title}
                          className="cbs-feature-card"
                          style={{ animationDelay: `${index * 120}ms` }}
                        >
                          <div className="cbs-feature-card__icon" aria-hidden="true">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h5>{title}</h5>
                          <p>{description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">No research page content has been published for this section yet.</p>
            )}
          </div>
          <section className="space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide border-b pb-2">Research News & Events</h3>
            {newsEvents.length === 0 ? (
              <div className="bg-white p-5 border rounded-lg text-xs text-slate-400">No research news or events are published yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newsEvents.map((item) => (
                  <article key={item.id} className="bg-white border rounded-lg overflow-hidden shadow-sm min-w-0">
                    <img src={item.image} alt="" className="w-full h-32 object-cover bg-slate-100" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                    <div className="p-4 space-y-2">
                      <p className="text-[10px] font-bold text-[#7a1f2b]">{item.date}</p>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="bg-slate-100 text-slate-500 text-[9px] rounded px-1.5 py-0.5">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-6 min-w-0">
          <div className="bg-white p-4 border rounded-2xl space-y-3 shadow-sm">
            <h5 className="font-bold text-xs text-[#0b2341] uppercase border-b pb-1">Research Forms</h5>
            <div className="space-y-2">
              {downloads.filter((download) => download.category === 'research-forms').map((download) => (
                <div key={download.id} className="text-xs flex justify-between items-center gap-2 bg-slate-50 p-2 rounded min-w-0">
                  <span className="font-semibold text-slate-800 line-clamp-1">{download.title}</span>
                  <a href={download.fileUrl} className="text-[#0b2341] hover:text-[#7a1f2b] shrink-0">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ResearchOverview({ onSelectPage }: { onSelectPage: (slug: string | null) => void }) {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-[18rem]">
            <img
              src="/uploads/slider-1779947017726-d2269ecf232e4.jpg"
            alt="Trongsa College campus in the Himalayan landscape"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07172b]/88 via-[#07172b]/56 to-transparent" />
          <div className="relative max-w-2xl p-5 sm:p-8 md:p-10 text-white">
            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Inquiry rooted in Bhutanese heritage and Himalayan knowledge.
            </h3>
            <p className="mt-4 text-sm md:text-[15px] leading-7 text-slate-100">
              Trongsa College supports research, publications, centre-led projects, and collaborative inquiry across Buddhist studies, cultural heritage, language, society, and the Himalayan region.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {researchOverviewActions.map(({ title, description, Icon, href, slug }) => {
          const content = (
            <>
              <span className="clcs-document-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold text-[#0b2341]">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span>
              </span>
            </>
          );

          return href ? (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="clcs-card clcs-lift flex min-h-28 items-start gap-3 rounded-xl p-4 text-left"
            >
              {content}
            </a>
          ) : (
            <button
              key={title}
              type="button"
              onClick={() => onSelectPage(slug || null)}
              className="clcs-card clcs-lift flex min-h-28 items-start gap-3 rounded-xl p-4 text-left cursor-pointer"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}
