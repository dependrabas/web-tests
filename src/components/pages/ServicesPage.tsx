import { ArrowRight, ChevronDown, FileText, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';
import MarkdownContent from '../MarkdownContent';
import { StudentService } from '../../types';

interface ServicesPageProps {
  currentSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  services: StudentService[];
}

type ServiceNavigationItem = {
  children?: Array<{ slug: string; label: string }>;
  label: string;
  slug: string;
};

const serviceNavigation: ServiceNavigationItem[] = [
  {
    slug: 'campus-life',
    label: 'Campus Life',
    children: [
      { slug: 'it-lab', label: 'IT Lab' },
      { slug: 'language-centre', label: 'Language Centre' },
      { slug: 'culture', label: 'Culture' },
      { slug: 'sports-and-games', label: 'Sports & Games' },
      { slug: 'mess', label: 'Mess' }
    ]
  },
  {
    slug: 'student-clubs',
    label: 'Student Clubs',
    children: [
      { slug: 'dzongkha-literature', label: 'Dzongkha Literature' },
      { slug: 'media-club', label: 'Media Club' },
      { slug: 'clean-bhutan', label: 'Clean Bhutan' },
      { slug: 'karate-taekwondo', label: 'Karate / Taekwondo' },
      { slug: 'rovers', label: 'Rovers' },
      { slug: 'student-associations', label: 'Student Associations' }
    ]
  },
  { slug: 'student-centre', label: 'Student Centre' },
  { slug: 'counseling-services', label: 'Counseling Services' },
  { slug: 'accommodation', label: 'Accommodation' },
  { slug: 'student-parliament', label: 'Student Parliament' },
  { slug: 'student-handbook', label: 'Student Handbook' },
  { slug: 'discipline', label: 'Discipline' }
];

const serviceLabelMap = serviceNavigation.reduce<Record<string, string>>((labels, item) => {
  labels[item.slug] = item.label;
  item.children?.forEach((child) => {
    labels[child.slug] = child.label;
  });
  return labels;
}, {});

export default function ServicesPage({ currentSlug, onSelectSlug, services }: ServicesPageProps) {
  const selectedService = currentSlug ? services.find((service) => service.slug === currentSlug) : null;
  const serviceIndexBySlug = services.reduce<Record<string, number>>((indexMap, service, index) => {
    indexMap[service.slug] = index;
    return indexMap;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-8">
      <ServiceSubNav activeSlug={currentSlug} onSelectSlug={onSelectSlug} services={services} />

      {currentSlug ? (
        selectedService ? (
          <ServiceDetails
            index={serviceIndexBySlug[selectedService.slug] ?? 0}
            onSelectSlug={onSelectSlug}
            service={selectedService}
          />
        ) : (
          <article className="clcs-official-panel rounded-2xl p-5 sm:p-7 md:p-8">
            <button onClick={() => onSelectSlug(null)} className="service-detail-back">
              ← Back to Student Services
            </button>
            <span className="text-xs text-slate-400">Student service content not found.</span>
          </article>
        )
      ) : (
        <ServicesOverview onSelectSlug={onSelectSlug} services={services} />
      )}
    </div>
  );
}

function ServiceSubNav({
  activeSlug,
  onSelectSlug,
  services
}: {
  activeSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  services: StudentService[];
}) {
  const availableSlugs = new Set(services.map((service) => service.slug));
  const topLinkClass = (active: boolean) => `clcs-dropdown-top-link ${active ? 'is-active' : ''}`;
  const childLinkClass = (active: boolean) => `clcs-dropdown-child-link ${active ? 'is-active' : ''}`;

  return (
    <nav className="clcs-subnav clcs-dropdown-subnav rounded-2xl" aria-label="Student services navigation">
      <div className="clcs-dropdown-subnav-inner">
        <button type="button" onClick={() => onSelectSlug(null)} className="clcs-dropdown-brand">
          Student Services
        </button>

        {serviceNavigation.map((item) => {
          const children = item.children || [];
          const hasChildren = children.length > 0;
          const isActive = activeSlug === item.slug || children.some((child) => child.slug === activeSlug);

          if (hasChildren) {
            return (
              <div key={item.slug} className="clcs-dropdown-item">
                <button
                  type="button"
                  onClick={() => onSelectSlug(item.slug)}
                  disabled={!availableSlugs.has(item.slug)}
                  className={`${topLinkClass(Boolean(isActive))} disabled:opacity-45 disabled:cursor-not-allowed`}
                >
                  {item.label} <ChevronDown className="h-4 w-4" />
                </button>
                <div className="clcs-dropdown-panel">
                  <div className="clcs-dropdown-panel-title">{item.label}</div>
                  {children.map((child) => (
                    <button
                      key={child.slug}
                      onClick={() => onSelectSlug(child.slug)}
                      disabled={!availableSlugs.has(child.slug)}
                      className={`${childLinkClass(activeSlug === child.slug)} disabled:opacity-45 disabled:cursor-not-allowed`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.slug}
              onClick={() => onSelectSlug(item.slug)}
              disabled={!availableSlugs.has(item.slug)}
              className={`${topLinkClass(activeSlug === item.slug)} disabled:opacity-45 disabled:cursor-not-allowed`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ServicesOverview({
  onSelectSlug,
  services
}: {
  onSelectSlug: (slug: string) => void;
  services: StudentService[];
}) {
  return (
    <>
      <div className="service-overview-hero rounded-2xl p-6 sm:p-7">
        <div className="max-w-3xl">
          <span className="service-overview-kicker">
            <HeartHandshake className="w-4 h-4" />
            Student Affairs Division
          </span>
          <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-4xl mt-2">
            Student Services & Residential Life
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-6">
            Browse Campus Life, Student Clubs, accommodation, student leadership, counselling, discipline, and handbook resources.
          </p>
          <div className="service-overview-stats">
            <span><UsersRound className="w-4 h-4" /> {services.length} Service Areas</span>
            <span><ShieldCheck className="w-4 h-4" /> Student Support</span>
          </div>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="service-empty-state">
          <HeartHandshake className="w-8 h-8" />
          <p>No student services are published yet.</p>
        </div>
      ) : (
        <div className="service-card-grid mt-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              index={index}
              onSelectSlug={onSelectSlug}
              service={service}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ServiceCard({
  index,
  onSelectSlug,
  service
}: {
  index: number;
  onSelectSlug: (slug: string) => void;
  service: StudentService;
}) {
  return (
    <article className="service-card">
      <div className="service-card-media">
        {service.image ? (
          <img src={service.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        ) : (
          <div className="service-card-placeholder">
            <HeartHandshake className="w-10 h-10" />
          </div>
        )}
        <span className="service-card-code">SS {String(index + 1).padStart(2, '0')}</span>
        <span className="service-card-badge">{serviceLabelMap[service.slug] || 'CLCS Care'}</span>
      </div>

      <div className="service-card-body">
        <h4 className="service-card-title">{serviceLabelMap[service.slug] || service.title}</h4>
        <p className="service-card-copy">{service.description}</p>
        <div className="service-card-meta">
          <span><HeartHandshake className="w-4 h-4" /> Student Affairs</span>
          <span><ShieldCheck className="w-4 h-4" /> Campus Support</span>
        </div>
      </div>

      <div className="service-card-content">
        <button onClick={() => onSelectSlug(service.slug)} className="service-card-action">
          View service page <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

function ServiceDetails({
  index,
  onSelectSlug,
  service
}: {
  index: number;
  onSelectSlug: (slug: string | null) => void;
  service: StudentService;
}) {
  return (
    <article className="service-detail clcs-official-panel rounded-2xl">
      <button onClick={() => onSelectSlug(null)} className="service-detail-back">
        ← Back to Student Services
      </button>

      <div className="service-detail-layout">
        <div className="service-detail-media">
          {service.image ? (
            <img src={service.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          ) : (
            <div className="service-card-placeholder">
              <HeartHandshake className="w-12 h-12" />
            </div>
          )}
          <span>SS {String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="service-detail-content">
          <span className="service-overview-kicker">
            <FileText className="w-4 h-4" />
            Student Service
          </span>
          <h2>{serviceLabelMap[service.slug] || service.title}</h2>
          <p className="service-detail-lede">{service.description}</p>
          <div className="programme-feature-list">
            <span>Student Affairs managed</span>
            <span>Campus support resource</span>
            <span>Updated from admin service content</span>
          </div>
          <div className="service-detail-rich-copy">
            <MarkdownContent text={service.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
