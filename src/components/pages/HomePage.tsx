
import { ArrowRight, BookOpenCheck, CalendarDays, ChevronRight, Landmark, LibraryBig, Megaphone, Sparkles, UsersRound } from 'lucide-react';
import type { ComponentType } from 'react';
import HeroSlider from '../HeroSlider';
import { Announcement, HomepageSlider, Programme } from '../../types';

interface HomePageProps {
  announcements: Announcement[];
  onAnnouncementSearch: (title?: string, category?: Announcement['category']) => void;
  onNavigate: (tab: string, slug?: string | null) => void;
  programmes: Programme[];
  sliders: HomepageSlider[];
}

export default function HomePage({
  announcements,
  onAnnouncementSearch,
  onNavigate,
  programmes,
  sliders
}: HomePageProps) {
  return (
    <div>
      <HeroSlider
        sliders={sliders}
        onCTA={(link) => onNavigate(link.startsWith('/') ? link.replace('/', '') : 'academics')}
      />

      <div className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-16 relative z-10">
        <div className="clcs-glass rounded-2xl p-3 sm:p-5 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3">
          <TopMetric icon={UsersRound} label="Active students" value="1,200+" />
          <TopMetric icon={BookOpenCheck} label="Faculty scholars" value="85+" />
          <TopMetric icon={Landmark} label="Constituent" value="RUB college" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 space-y-8 min-w-0">
          <div className="clcs-section-shell rounded-2xl p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-full w-1 bg-clcs-gold pointer-events-none" />
            <span className="inline-flex items-center gap-2 text-[11px] bg-white text-[#8a5b00] font-extrabold px-3 py-1.5 rounded-full uppercase border border-[#b68a2a]/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Royal University of Bhutan constituent college
            </span>
            <h3 className="font-display font-black text-slate-950 text-2xl md:text-3xl lg:text-4xl mt-4 leading-tight max-w-3xl">
              Preserving Language and Cultural Arts, Inspiring Contemporary Innovation
            </h3>
            <p className="text-sm md:text-base text-slate-600 mt-4 leading-relaxed max-w-3xl">
              Welcome to Trongsa College / CLCS. Located high on the pristine mountainsides of Taktse, Trongsa, Bhutan-Himalayan scholar delegates describe our campus as a focused environment for academic research.
              We are dedicated to GNH-inspired learning, mapping ancient Buddhist mindfulness techniques alongside cognitive psychology, international geopolitics, and cultural enterprise development.
            </p>
            <button onClick={() => onNavigate('about')} className="mt-5 bg-clcs-navy text-white hover:bg-clcs-maroon px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition">
              <span>Read College Overview</span> <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          <section>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
              <div>
                <h4 className="text-[#0b2341] font-display font-extrabold text-xl md:text-2xl">
                  Featured Academic Programmes
                </h4>
                <p className="text-sm text-gray-500 mt-1">Prepare for global opportunities aligned with GNH values.</p>
              </div>
              <button onClick={() => onNavigate('academics')} className="self-start sm:self-auto text-[#0b2341] hover:text-[#7a1f2b] text-sm font-bold cursor-pointer flex items-center gap-1">
                View All Programmes <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programmes.map((programme) => (
                <button
                  key={programme.id}
                  onClick={() => onNavigate('academics', programme.slug)}
                  className="clcs-card clcs-lift p-5 rounded-xl cursor-pointer group duration-150 text-left min-w-0 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-clcs-gold/10 rounded-bl-full" />
                  <span className="text-[10px] text-[#7a1f2b] font-bold uppercase tracking-wider">{programme.level} • {programme.duration}</span>
                  <h5 className="font-display font-extrabold text-[#0b2341] text-base mt-2 group-hover:text-[#7a1f2b] leading-snug">
                    {programme.title}
                  </h5>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">{programme.description}</p>
                  <span className="mt-4 text-sm text-[#0b2341] font-bold flex items-center gap-1">
                    View details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="p-5 sm:p-6 bg-clcs-navy text-white rounded-2xl shadow-xl shadow-slate-900/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border border-clcs-gold/25">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-clcs-gold text-slate-950 font-bold px-3 py-1 rounded-full text-xs uppercase"><CalendarDays className="w-3.5 h-3.5" /> Upcoming Intake</span>
              <h5 className="font-display font-bold text-xl mt-3">Are you ready to join Class of July 2026?</h5>
              <p className="text-sm text-slate-300 mt-1">Government scholarships and hostel allotments are processed sequentially.</p>
            </div>
            <button onClick={() => onNavigate('admissions')} className="bg-[#b68a2a] text-slate-950 hover:bg-white text-sm px-5 py-3 font-bold rounded-lg cursor-pointer duration-150">
              Admissions Guide
            </button>
          </div>
        </div>

        <aside className="space-y-6 min-w-0">
          <div className="clcs-card p-5 rounded-2xl">
            <h3 className="text-[#0b2341] font-display font-black text-base mb-4 border-l-4 border-[#b68a2a] pl-3">
              College at a Glance
            </h3>
            <div className="grid grid-cols-1 gap-4 text-center">
              <Stat value="1,200+" label="Active Students" edge="border-b" />
              <Stat value="85+" label="Faculty Scholars" edge="border-b" />
              <Stat value="Nu. 0" label="Sponsored Tuition" accent />
            </div>
          </div>

          <div className="clcs-card rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-white px-5 py-4 border-b border-slate-200 flex justify-between items-center gap-3">
              <h3 className="text-[#0b2341] font-display font-black text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-clcs-maroon" /> Announcements</h3>
              <div className="flex gap-1.5 items-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-clcs-gold animate-pulse"></div>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Live Feed</span>
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-[350px] overflow-y-auto">
              {announcements.length === 0 ? (
                <p className="text-[11px] text-slate-400 text-center py-6">No announcements are published yet.</p>
              ) : (
                announcements.slice(0, 4).map((announcement) => (
                  <article key={announcement.id} className="group space-y-2 block border-b last:border-none border-slate-100 pb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-[#7a1f2b]/10 text-[#7a1f2b] text-[8px] px-2 py-0.5 rounded font-extrabold">{announcement.category}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{announcement.date}</span>
                    </div>
                    <button onClick={() => onAnnouncementSearch(announcement.title, announcement.category)} className="text-left text-sm font-bold text-slate-800 leading-snug hover:text-[#0b2341] cursor-pointer">
                      {announcement.title}
                    </button>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{announcement.description}</p>
                  </article>
                ))
              )}
            </div>
            <button onClick={() => onAnnouncementSearch()} className="p-4 text-center bg-slate-50 text-xs font-bold text-slate-500 border-t border-slate-200 hover:text-[#0b2341] transition-colors cursor-pointer">
              See All Announcements
            </button>
          </div>

          <div className="bg-clcs-navy text-white p-5 rounded-2xl shadow-xl shadow-clcs-navy/20 border border-[#b68a2a]/35 relative overflow-hidden">
            <div className="absolute bottom-[-10px] right-[-10px] text-white/5 font-display text-7xl font-black">CLCS</div>
            <h4 className="font-display font-bold text-lg text-[#b68a2a]">Academic Koha / VLE Portals</h4>
            <p className="text-sm mt-2 text-slate-200 leading-relaxed">Access virtual learning, submit journal abstracts, or review transcripts directly.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-center font-bold">
              <a href="https://vle.clcs.edu.bt" target="_blank" rel="noreferrer" className="p-3 bg-white/10 hover:bg-white/25 rounded-lg border border-white/20">VLE Portal</a>
              <a href="https://ims.rub.edu.bt" target="_blank" rel="noreferrer" className="p-3 bg-[#b68a2a] text-slate-950 hover:bg-white rounded-lg">RUB IMS Cloud</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ accent, edge, label, value }: { accent?: boolean; edge?: string; label: string; value: string }) {
  return (
    <div className={`p-2 border-slate-100 ${edge || ''}`}>
      <div className={`text-2xl font-black ${accent ? 'text-[#b68a2a]' : 'text-[#0b2341]'}`}>{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 leading-tight">{label}</div>
    </div>
  );
}

function TopMetric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0 rounded-xl bg-white/70 p-3 border border-white/70">
      <div className="h-10 w-10 rounded-lg bg-[#0b2341] text-[#b68a2a] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="font-black text-slate-950 text-base leading-tight truncate">{value}</div>
        <div className="text-[10px] uppercase text-slate-500 font-bold leading-tight">{label}</div>
      </div>
    </div>
  );
}
