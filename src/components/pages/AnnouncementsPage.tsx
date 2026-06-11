import { Calendar, FileText, Search, Info } from 'lucide-react';
import { Announcement } from '../../types';

interface AnnouncementsPageProps {
  activeCategoryFilter: string;
  announcements: Announcement[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const categories = ['Announcements', 'Tenders', 'Job Vacancies', 'News and Events'];

export default function AnnouncementsPage({
  activeCategoryFilter,
  announcements,
  onCategoryChange,
  onSearchChange,
  searchQuery
}: AnnouncementsPageProps) {
  const selectedCategory = activeCategoryFilter === 'All' ? 'Announcements' : activeCategoryFilter;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="clcs-section-shell p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-clcs-navy font-display font-black text-2xl sm:text-3xl tracking-tight">College Announcements</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl font-medium">
            Stay updated with the latest notices, procurement opportunities, careers, and institutional highlights from the College of Language and Culture Studies.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-clcs-gold/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      <div className="clcs-glass p-5 rounded-2xl border flex flex-col lg:flex-row justify-between lg:items-center gap-6">
        <div className="flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`clcs-subnav-link px-4 py-2 transition-all duration-300 ${
                selectedCategory === category ? 'is-active' : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96 group">
          <label className="sr-only">Search notices</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-clcs-gold/20 focus:border-clcs-gold transition-all pr-10 font-medium placeholder:text-slate-400"
            placeholder="Filter announcements by title or content..."
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-2.5 group-focus-within:text-clcs-gold transition-colors" />
        </div>
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <div className="clcs-official-panel p-16 text-center rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No records found matching your criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <article 
              key={announcement.id} 
              className="clcs-card clcs-lift p-5 sm:p-7 rounded-2xl relative flex flex-col md:flex-row justify-between gap-6 overflow-hidden group"
            >
              <div className="space-y-4 min-w-0 flex-1">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="bg-clcs-maroon/10 text-clcs-maroon font-black text-[10px] px-2.5 py-1 rounded-md tracking-wider uppercase border border-clcs-maroon/10">
                    {announcement.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-clcs-gold" /> {announcement.date}
                  </span>
                </div>
                
                <h4 className="font-display font-bold text-clcs-navy text-lg sm:text-xl group-hover:text-clcs-maroon transition-colors duration-300">
                  {announcement.title}
                </h4>
                
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {announcement.description}
                </p>
              </div>

              <div className="flex items-center md:justify-end shrink-0 md:pl-6 md:border-l md:border-slate-100">
                <a 
                  href={announcement.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="programme-card-action px-6 py-3 min-w-[160px] group/btn"
                >
                  <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span>View Document</span>
                </a>
              </div>
              
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-clcs-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </article>
          ))
        )}
      </div>
      
      <div className="bhutanese-trim mt-12 opacity-40"></div>
    </div>
  );
}
