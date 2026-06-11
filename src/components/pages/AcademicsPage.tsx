import { ArrowRight, CalendarDays, ChevronDown, Clock, Download, ExternalLink, FileText, GraduationCap, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import MarkdownContent from '../MarkdownContent';
import ProfileDirectory from '../ProfileDirectory';
import { ContactInfo, DownloadItem, Page, Programme, StaffProfile } from '../../types';

interface AcademicsPageProps {
  contact: ContactInfo;
  currentSlug: string | null;
  downloads: DownloadItem[];
  onNavigate: (tab: string, slug?: string | null) => void;
  onSelectSlug: (slug: string | null) => void;
  pages: Page[];
  programmes: Programme[];
  staff: StaffProfile[];
}

const admissionLinks = [
  { slug: 'admission-information', label: 'Admission Information' },
  { slug: 'application-process', label: 'Application Process' },
  { slug: 'selection-criteria', label: 'Selection Criteria' },
  { slug: 'admission-confirmation', label: 'Admission Confirmation' }
];

const libraryLinks = [
  { slug: 'koha-library', label: 'Koha Library' },
  { slug: 'e-library', label: 'e-Library' }
];

const academicPageLinks: Array<{ slug: string; label: string; externalUrl?: string }> = [
  { slug: 'examination-office', label: 'Examination Office' },
  { slug: 'academic-guidelines', label: 'Academic Guidelines' },
  { slug: 'international-programs', label: 'International Programs' },
  { slug: 'convocation-registration', label: 'Convocation Registration' },
  { slug: 'wal', label: 'WAL', externalUrl: 'https://www.rub.edu.bt/regulation/' }
];

const calendarTypeLabels: Record<string, string> = {
  admission: 'Admission',
  deadline: 'Deadline',
  event: 'Event',
  exam: 'Examination',
  holiday: 'Holiday',
  semester: 'Semester'
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const bhutanNationalHolidays: Record<number, Array<{ date: string; title: string }>> = {
  2026: [
    { date: '2026-01-02', title: 'Nyilo' },
    { date: '2026-01-19', title: 'Traditional Day of Offering' },
    { date: '2026-02-18', title: 'Losar' },
    { date: '2026-02-19', title: 'Losar Holiday' },
    { date: '2026-02-21', title: 'Birth Anniversary of His Majesty the King' },
    { date: '2026-02-22', title: 'Birth Anniversary Holiday' },
    { date: '2026-02-23', title: 'Birth Anniversary Holiday' },
    { date: '2026-04-26', title: 'Zhabdrung Kuchhoe' },
    { date: '2026-05-02', title: 'Birth Anniversary of 3rd Druk Gyalpo' },
    { date: '2026-06-01', title: "Lord Buddha's Parinirvana" },
    { date: '2026-06-24', title: 'Birth Anniversary of Guru Rinpoche' },
    { date: '2026-07-18', title: 'First Sermon of Lord Buddha' },
    { date: '2026-09-21', title: 'Thimphu Tshechu' },
    { date: '2026-09-22', title: 'Thimphu Tshechu' },
    { date: '2026-09-23', title: 'Blessed Rainy Day' },
    { date: '2026-10-21', title: 'Dassain' },
    { date: '2026-11-11', title: 'Birth Anniversary of 4th Druk Gyalpo' },
    { date: '2026-12-17', title: 'National Day' }
  ]
};

type AcademicCalendarEntry = {
  calendarType: DownloadItem['calendarType'];
  date: Date;
  description?: string;
  endDate?: Date | null;
  eventUrl?: string;
  id: string;
  isAutomaticHoliday?: boolean;
  time?: string;
  title: string;
  venue?: string;
};

function parseCalendarDate(download: DownloadItem) {
  const value = download.calendarDate || download.dateAdded;
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCalendarDate(date: Date) {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCalendarMonth(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBhutanHolidaysForYear(year: number): AcademicCalendarEntry[] {
  return (bhutanNationalHolidays[year] || [])
    .map((holiday) => {
      const date = new Date(`${holiday.date}T00:00:00`);
      return {
        calendarType: 'holiday' as const,
        date,
        description: 'Automatically shown national holiday.',
        id: `holiday-${holiday.date}-${holiday.title}`,
        isAutomaticHoliday: true,
        title: holiday.title
      };
    })
    .filter((holiday) => !Number.isNaN(holiday.date.getTime()));
}

function buildCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date | null; day: number | null }> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push({ date: null, day: null });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ date: new Date(year, month, day), day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }

  return cells;
}

export default function AcademicsPage({
  contact,
  currentSlug,
  downloads,
  onNavigate,
  onSelectSlug,
  pages,
  programmes,
  staff
}: AcademicsPageProps) {
  const selectedProgramme = currentSlug ? programmes.find((programme) => programme.slug === currentSlug) : null;
  const selectedPage = currentSlug ? pages.find((page) => page.slug === currentSlug && page.category === 'academics') : null;
  const facultyProfiles = staff.filter((profile) => profile.profileType === 'faculty');
  const academicCalendarDownloads = downloads.filter((download) => download.category === 'academic-calendar');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
      <AcademicSubNav
        activeSlug={currentSlug}
        onNavigate={onNavigate}
        onSelectSlug={onSelectSlug}
        pages={pages}
        programmes={programmes}
      />

      <div>
        {currentSlug ? (
          selectedProgramme ? (
            <ProgrammeDetails contact={contact} onNavigate={onNavigate} onSelectSlug={onSelectSlug} programme={selectedProgramme} programmes={programmes} />
          ) : currentSlug === 'academic-calendar' ? (
            <AcademicCalendarDetails downloads={academicCalendarDownloads} onSelectSlug={onSelectSlug} />
          ) : currentSlug === 'faculty-profiles' ? (
            <FacultyProfilesDetails onSelectSlug={onSelectSlug} profiles={facultyProfiles} />
          ) : selectedPage ? (
            <AcademicPageDetails onSelectSlug={onSelectSlug} page={selectedPage} />
          ) : (
            <span className="text-xs text-slate-400">Academic content not found.</span>
          )
        ) : (
          <AcademicsOverview
            onSelectSlug={onSelectSlug}
            programmes={programmes}
            staff={staff}
          />
        )}
      </div>
    </div>
  );
}

function ProgrammeDetails({
  contact,
  onNavigate,
  onSelectSlug,
  programme,
  programmes
}: {
  contact: ContactInfo;
  onNavigate: (tab: string, slug?: string | null) => void;
  onSelectSlug: (slug: string | null) => void;
  programme: Programme;
  programmes: Programme[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'requirements' | 'features'>('overview');
  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'curriculum' as const, label: 'Curriculum' },
    { id: 'requirements' as const, label: 'Requirements' },
    { id: 'features' as const, label: 'Course Features' }
  ];

  return (
    <article className="programme-detail">
      <div className="programme-detail-body">
        <button onClick={() => onSelectSlug(null)} className="programme-detail-back">
          ← Back to Programmes
        </button>
        <div className="programme-selector-row">
          <label htmlFor="programme-selector">Choose Programme</label>
          <select
            id="programme-selector"
            value={programme.slug}
            onChange={(event) => onSelectSlug(event.target.value)}
          >
            {programmes.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="programme-tab-intro">
          <h3>{programme.title}</h3>
        </div>

        <div className="programme-tab-list" role="tablist" aria-label="Programme details">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'is-active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="programme-tab-panel">
          {activeTab === 'overview' && (
            <div className="programme-rich-copy">
              <h3>Programme Overview</h3>
              <p>{programme.description}</p>
              <p>
                The programme is designed to support reflective learning, cultural understanding, and applied professional skills. Students build a strong academic foundation while engaging with Bhutanese and Himalayan contexts through guided study, discussion, and practice.
              </p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="programme-curriculum-grid">
              <div className="programme-rich-copy">
                <h3>Curriculum</h3>
                <p>
                  The curriculum combines core modules, guided reading, field-oriented learning, and assessment tasks that strengthen research, communication, and analytical ability.
                </p>
                <div className="programme-feature-list">
                  <span>Semester-based learning structure</span>
                  <span>Core and elective academic modules</span>
                  <span>Continuous assessment and final examination</span>
                  <span>Research, presentation, and writing practice</span>
                </div>
              </div>
              <div className="programme-download-panel">
                <FileText className="w-8 h-8" />
                <h4>Complete Syllabus Catalog</h4>
                <p>Includes detailed module structure, credit requirements, and semester information.</p>
                <a href={programme.downloadUrl} target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4" /> Download Syllabus PDF
                </a>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="programme-requirement-layout">
              <div className="programme-rich-copy">
                <h3>Entry & Minimum Eligibility Criteria</h3>
                <p>{programme.eligibility}</p>
              </div>
              <div className="programme-requirement-cards">
                <Requirement label="Duration" value={programme.duration} />
                <Requirement label="Academic Semester" value="Starts July 2026" />
                <Requirement label="Boarding Options" value="Fully Residential" accent />
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="programme-features-grid">
              <article>
                <GraduationCap className="w-6 h-6" />
                <h4>Academic Foundation</h4>
                <p>Structured modules develop disciplinary knowledge and confidence in academic work.</p>
              </article>
              <article>
                <ShieldCheck className="w-6 h-6" />
                <h4>Recognized Degree</h4>
                <p>Programme information is maintained as an accredited RUB degree offering.</p>
              </article>
              <article>
                <MapPin className="w-6 h-6" />
                <h4>Residential Learning</h4>
                <p>Campus life supports close mentorship, peer learning, and student participation.</p>
              </article>
              <article>
                <Mail className="w-6 h-6" />
                <h4>Advisor Support</h4>
                <p>Students can contact the academic office for guidance on admissions and study planning.</p>
              </article>
            </div>
          )}
        </section>

        <div className="programme-action-strip">
          <div>
            <h4>Need admission guidance?</h4>
            <p>
              Contact {contact.email} or call {contact.phone.split('/')[0]} for programme and application support.
            </p>
          </div>
          <button onClick={() => onNavigate('admissions')}>
            Proceed to Admissions <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function AcademicsOverview({
  onSelectSlug,
  programmes,
  staff
}: {
  onSelectSlug: (slug: string) => void;
  programmes: Programme[];
  staff: StaffProfile[];
}) {
  const facultyProfiles = staff.filter((profile) => profile.profileType === 'faculty');

  return (
    <div className="space-y-6">
      <div className="min-w-0 space-y-8">
        <div className="programme-overview-hero rounded-2xl p-6 sm:p-7">
          <div className="max-w-3xl">
            <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-4xl">Academic Programmes</h2>
            <p className="text-sm text-slate-600 mt-3 leading-6">Explore CLCS undergraduate programmes, eligibility information, and course resources maintained by the academic office.</p>
            <div className="programme-overview-stats">
              <span><GraduationCap className="w-4 h-4" /> {programmes.length} Degree Programmes</span>
              <span><Clock className="w-4 h-4" /> Full-Time Study</span>
            </div>
          </div>
        </div>
        <div className="programme-card-grid">
          {programmes.length === 0 && (
            <div className="programme-empty-state">
              <GraduationCap className="w-8 h-8" />
              <p>No academic programmes are published yet.</p>
            </div>
          )}
          {programmes.map((programme, index) => (
            <article key={programme.id} className="programme-card">
              <div className="programme-card-media">
                {programme.image ? (
                  <img src={programme.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                ) : (
                  <div className="programme-card-placeholder">
                    <GraduationCap className="w-10 h-10" />
                  </div>
                )}
                <span className="programme-card-code">BA {String(index + 1).padStart(2, '0')}</span>
                <span className="programme-card-badge">{programme.level}</span>
              </div>
              <div className="programme-card-body">
                <h4 className="programme-card-title">{programme.title}</h4>
                <p className="programme-card-copy">{programme.description}</p>
                <div className="programme-card-meta">
                  <span><Clock className="w-4 h-4" /> {programme.duration}</span>
                  <span><CalendarDays className="w-4 h-4" /> Starts July</span>
                </div>
              </div>
              <div className="programme-card-footer">
                <button onClick={() => onSelectSlug(programme.slug)} className="programme-card-action">
                  Review syllabus eligibility <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
        <section className="grid grid-cols-1 gap-6">
          <ProfileDirectory
            emptyText="No faculty profiles are published yet."
            profiles={facultyProfiles}
            title="Our Faculty"
          />
        </section>
      </div>
    </div>
  );
}

function AcademicCalendarDetails({
  downloads,
  onSelectSlug
}: {
  downloads: DownloadItem[];
  onSelectSlug: (slug: string | null) => void;
}) {
  return (
    <article className="clcs-official-panel rounded-2xl p-5 sm:p-7 md:p-8">
      <button onClick={() => onSelectSlug(null)} className="bg-white hover:bg-slate-50 text-[#0b2341] border border-slate-200 rounded-lg text-xs px-4 py-2 mb-5 font-bold cursor-pointer">
        ← Back to Academics
      </button>
      <AcademicCalendarPanel downloads={downloads} />
    </article>
  );
}

function AcademicCalendarPanel({ downloads }: { downloads: DownloadItem[] }) {
  const collegeEvents = downloads
    .reduce<AcademicCalendarEntry[]>((events, download) => {
      const date = parseCalendarDate(download);
      if (!date) return events;

      const endDate = download.calendarEndDate ? new Date(`${download.calendarEndDate}T00:00:00`) : null;
      events.push({
        calendarType: download.calendarType || 'event',
        date,
        description: download.description,
        endDate,
        eventUrl: download.eventUrl || (download.fileUrl && download.fileUrl !== '#' ? download.fileUrl : undefined),
        id: download.id,
        time: download.calendarTime,
        title: download.title,
        venue: download.calendarVenue
      });
      return events;
    }, [])
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const displayMonth = collegeEvents[0]?.date || new Date();
  const automaticHolidays = getBhutanHolidaysForYear(displayMonth.getFullYear())
    .filter((holiday) => holiday.date.getMonth() === displayMonth.getMonth());
  const calendarEvents = [...collegeEvents, ...automaticHolidays]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const cells = buildCalendarCells(displayMonth);
  const eventKeyMap = calendarEvents.reduce<Record<string, AcademicCalendarEntry[]>>((acc, event) => {
    const key = toDateKey(event.date);
    acc[key] = [...(acc[key] || []), event];
    return acc;
  }, {});
  const upcomingEvents = calendarEvents.slice(0, 6);
  const attachmentDownloads = downloads.filter((download) => download.fileUrl && download.fileUrl !== '#');

  return (
    <section className="academic-calendar-panel">
      <div className="academic-calendar-header">
        <div className="min-w-0">
          <span className="academic-calendar-kicker"><CalendarDays className="w-4 h-4" /> Academic Calendar</span>
          <h3>{formatCalendarMonth(displayMonth)}</h3>
          <p>Key academic dates, examinations, registry deadlines, and student events.</p>
        </div>
        <div className="academic-calendar-count">
          <strong>{collegeEvents.length}</strong>
          <span>College events</span>
        </div>
      </div>

      <div className="academic-calendar-legend" aria-label="Calendar colour legend">
        <span className="type-event">Event</span>
        <span className="type-admission">Admission</span>
        <span className="type-deadline">Deadline</span>
        <span className="type-exam">Exam</span>
        <span className="type-semester">Semester</span>
        <span className="type-holiday">National holiday</span>
        <span className="type-weekend">Weekend</span>
      </div>

      <div className="academic-calendar-layout">
        <div className="academic-calendar-grid" aria-label="Academic calendar month view">
          {weekdayLabels.map((weekday) => (
            <div key={weekday} className="academic-calendar-weekday">{weekday}</div>
          ))}
          {cells.map((cell, index) => {
            const key = cell.date ? toDateKey(cell.date) : undefined;
            const dayEvents = key ? eventKeyMap[key] || [] : [];
            const isWeekend = cell.date ? [0, 6].includes(cell.date.getDay()) : false;
            const hasHoliday = dayEvents.some((event) => event.calendarType === 'holiday');
            return (
              <div key={`${key || 'blank'}-${index}`} className={`academic-calendar-day ${cell.day ? '' : 'is-muted'} ${isWeekend ? 'is-weekend' : ''} ${hasHoliday ? 'is-national-holiday' : ''} ${dayEvents.length ? 'has-event' : ''}`}>
                {cell.day && <span className="academic-calendar-day-number">{cell.day}</span>}
                <div className="academic-calendar-day-events">
                  {dayEvents.slice(0, 2).map((event) => (
                    <span key={event.id} className={`academic-calendar-chip type-${event.calendarType || 'event'}`}>{event.title}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="academic-calendar-agenda">
          <h4>Upcoming Schedule</h4>
          {upcomingEvents.length === 0 ? (
            <div className="academic-calendar-empty">
              <CalendarDays className="w-8 h-8" />
              <p>No college events or automatic holidays are available for this month.</p>
            </div>
          ) : upcomingEvents.map((event) => {
            const hasValidEndDate = event.endDate && !Number.isNaN(event.endDate.getTime()) && event.endDate.getTime() !== event.date.getTime();

            return (
              <article key={event.id} className={`academic-calendar-agenda-card type-${event.calendarType || 'event'}`}>
                <div className="academic-calendar-datebox">
                  <span>{event.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <strong>{event.date.getDate()}</strong>
                </div>
                <div className="min-w-0">
                  <span className="academic-calendar-type">{event.isAutomaticHoliday ? 'National Holiday' : calendarTypeLabels[event.calendarType || 'event'] || 'Event'}</span>
                  <h5>{event.title}</h5>
                  {hasValidEndDate && event.endDate && <p>{formatCalendarDate(event.date)} to {formatCalendarDate(event.endDate)}</p>}
                  {event.description && <p>{event.description}</p>}
                  <div className="academic-calendar-meta">
                    {event.time && <span><Clock className="w-3.5 h-3.5" /> {event.time}</span>}
                    {event.venue && <span><MapPin className="w-3.5 h-3.5" /> {event.venue}</span>}
                    {event.eventUrl && (
                      <a href={event.eventUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> Link
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </aside>
      </div>

      {attachmentDownloads.length > 0 && (
        <div className="academic-calendar-attachments">
          {attachmentDownloads.map((download) => (
            <a key={download.id} href={download.fileUrl} target="_blank" rel="noreferrer">
              <FileText className="w-4 h-4" />
              <span>{download.title}</span>
              <Download className="w-4 h-4 ml-auto" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function AcademicSubNav({
  activeSlug,
  onNavigate,
  onSelectSlug,
  pages,
  programmes
}: {
  activeSlug: string | null;
  onNavigate: (tab: string, slug?: string | null) => void;
  onSelectSlug: (slug: string | null) => void;
  pages: Page[];
  programmes: Programme[];
}) {
  const topLinkClass = (active: boolean) => `clcs-dropdown-top-link ${active ? 'is-active' : ''}`;
  const childLinkClass = (active: boolean) => `clcs-dropdown-child-link ${active ? 'is-active' : ''}`;
  const renderAcademicPageLink = (item: { slug: string; label: string; externalUrl?: string }) => {
    const page = pages.find((pageItem) => pageItem.slug === item.slug && pageItem.category === 'academics');
    const active = activeSlug === item.slug;
    const className = `${childLinkClass(active)} disabled:opacity-45 disabled:cursor-not-allowed`;

    return item.externalUrl || page?.externalUrl ? (
      <a
        key={item.slug}
        href={item.externalUrl || page?.externalUrl}
        target="_blank"
        rel="noreferrer"
        className={childLinkClass(active)}
      >
        {item.label}
      </a>
    ) : (
      <button
        key={item.slug}
        onClick={() => onSelectSlug(item.slug)}
        disabled={!page}
        className={className}
      >
        {item.label}
      </button>
    );
  };

  return (
    <nav className="clcs-subnav clcs-dropdown-subnav rounded-2xl" aria-label="Academic section navigation">
      <div className="clcs-dropdown-subnav-inner">
        <div className="clcs-dropdown-brand">
          Academics
        </div>

        <div className="clcs-dropdown-item">
          <button type="button" className={topLinkClass(false)}>
            Admissions <ChevronDown className="h-4 w-4" />
          </button>
          <div className="clcs-dropdown-panel">
            <div className="clcs-dropdown-panel-title">Admissions</div>
            {admissionLinks.map((item) => (
              <button
                key={item.slug}
                onClick={() => onNavigate('admissions', item.slug)}
                className={childLinkClass(false)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {programmes.length > 0 && (
          <div className="clcs-dropdown-item clcs-dropdown-item--wide">
            <button type="button" className={topLinkClass(programmes.some((programme) => programme.slug === activeSlug))}>
              Programs <ChevronDown className="h-4 w-4" />
            </button>
            <div className="clcs-dropdown-panel clcs-dropdown-panel--wide">
              <div className="clcs-dropdown-panel-title">Degree Programs</div>
              {programmes.map((programme) => (
                <button
                  key={programme.id}
                  onClick={() => onSelectSlug(programme.slug)}
                  className={childLinkClass(activeSlug === programme.slug)}
                >
                  {programme.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => onSelectSlug('academic-calendar')} className={topLinkClass(activeSlug === 'academic-calendar')}>
          Academic Calendar
        </button>

        <button onClick={() => onSelectSlug('faculty-profiles')} className={topLinkClass(activeSlug === 'faculty-profiles')}>
          Faculty Profiles
        </button>

        <div className="clcs-dropdown-item">
          <button type="button" className={topLinkClass(libraryLinks.some((item) => item.slug === activeSlug))}>
            Library <ChevronDown className="h-4 w-4" />
          </button>
          <div className="clcs-dropdown-panel">
            <div className="clcs-dropdown-panel-title">Library</div>
            {libraryLinks.map((item) => renderAcademicPageLink(item))}
          </div>
        </div>

        <div className="clcs-dropdown-item">
          <button type="button" className={topLinkClass(academicPageLinks.some((item) => item.slug === activeSlug))}>
            More <ChevronDown className="h-4 w-4" />
          </button>
          <div className="clcs-dropdown-panel clcs-dropdown-panel--right">
            <div className="clcs-dropdown-panel-title">Academic Services</div>
            {academicPageLinks.map((item) => renderAcademicPageLink(item))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AcademicPageDetails({ onSelectSlug, page }: { onSelectSlug: (slug: string | null) => void; page: Page }) {
  return (
    <article className="clcs-official-panel rounded-2xl p-5 sm:p-7 md:p-8 max-w-5xl">
      <button onClick={() => onSelectSlug(null)} className="bg-white hover:bg-slate-50 text-[#0b2341] border border-slate-200 rounded-lg text-xs px-4 py-2 mb-5 font-bold cursor-pointer">
        ← Back to Academics
      </button>
      <div className="border-b border-slate-200 pb-5 mb-5 flex gap-4">
        <div className="clcs-document-mark h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="inline-block text-[10px] bg-[#f7f4ee] text-[#8a5b00] border border-[#b68a2a]/35 rounded-full px-3 py-1 uppercase font-bold">
            Updated {page.lastUpdated}
          </span>
          <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-3xl mt-2">{page.title}</h2>
        </div>
      </div>
      <MarkdownContent text={page.content} />
    </article>
  );
}

function FacultyProfilesDetails({
  onSelectSlug,
  profiles
}: {
  onSelectSlug: (slug: string | null) => void;
  profiles: StaffProfile[];
}) {
  return (
    <article className="clcs-official-panel rounded-2xl p-5 sm:p-7 md:p-8">
      <button onClick={() => onSelectSlug(null)} className="bg-white hover:bg-slate-50 text-[#0b2341] border border-slate-200 rounded-lg text-xs px-4 py-2 mb-5 font-bold cursor-pointer">
        ← Back to Academics
      </button>
      <ProfileDirectory
        emptyText="No faculty profiles are published yet."
        profiles={profiles}
        title="Our Faculty"
      />
    </article>
  );
}

function Requirement({ accent, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold text-slate-800 ${accent ? 'text-[#7a1f2b]' : ''}`}>{value}</span>
    </div>
  );
}
