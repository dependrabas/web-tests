import { Download, FileCheck2 } from 'lucide-react';
import MarkdownContent from '../MarkdownContent';
import { DownloadItem, Page } from '../../types';

interface AdmissionsPageProps {
  currentSlug: string | null;
  downloads: DownloadItem[];
  onSelectPage: (slug: string) => void;
  pages: Page[];
}

const admissionsLinks = [
  { slug: 'admission-information', label: 'Admission Information' },
  { slug: 'application-process', label: 'Application Process' },
  { slug: 'selection-criteria', label: 'Selection Criteria' },
  { slug: 'admission-confirmation', label: 'Admission Confirmation' }
];

export default function AdmissionsPage({
  currentSlug,
  downloads,
  onSelectPage,
  pages
}: AdmissionsPageProps) {
  const activeSlug = admissionsLinks.some((link) => link.slug === currentSlug) ? currentSlug : 'admission-information';
  const page = pages.find((entry) => entry.slug === activeSlug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 space-y-7">
      <div className="clcs-section-shell rounded-2xl p-6 sm:p-7">
        <span className="text-[11px] font-extrabold uppercase text-clcs-maroon tracking-wide">Registrar Notice Desk</span>
        <h2 className="text-[#0b2341] font-display font-extrabold text-2xl sm:text-3xl mt-1">Admissions & Intake Information</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-3xl">Review the current application guidance and downloadable admission resources maintained by the college.</p>
      </div>
      <nav className="clcs-subnav p-3 pl-5 rounded-2xl flex flex-wrap gap-2" aria-label="Admissions section navigation">
          {admissionsLinks.map((item) => (
            <button
              key={item.slug}
              onClick={() => onSelectPage(item.slug)}
              className={`clcs-subnav-link ${activeSlug === item.slug ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <div className="space-y-6 min-w-0">
          <section className="clcs-official-panel p-5 sm:p-7 md:p-8 rounded-2xl min-h-72">
            {page ? (
              <>
                <div className="border-b border-slate-200 pb-5 mb-5 flex gap-4">
                  <div className="clcs-document-mark h-12 w-12 rounded-xl flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block text-[10px] bg-[#f7f4ee] text-[#8a5b00] border border-[#b68a2a]/35 rounded-full px-3 py-1 uppercase font-bold">
                      Updated {page.lastUpdated}
                    </span>
                    <h3 className="text-[#0b2341] font-display font-extrabold text-2xl mt-2">{page.title}</h3>
                  </div>
                </div>
                <MarkdownContent text={page.content} />
              </>
            ) : (
              <p className="py-10 text-xs text-slate-400 text-center">No admission content has been published for this section yet.</p>
            )}
          </section>
          <section className="space-y-3">
            <h5 className="font-extrabold text-slate-800 text-xs uppercase border-b pb-2 tracking-wide">Download Admissions Resources</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {downloads.filter((download) => download.category === 'admission-forms').map((download) => (
                <article key={download.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#b68a2a] transition flex justify-between items-center gap-3 text-xs min-w-0 shadow-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 leading-tight">{download.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">File Size: {download.fileSize}</p>
                  </div>
                  <a href={download.fileUrl} className="text-[#0b2341] hover:text-[#7a1f2b] p-1.5 hover:bg-slate-50 rounded shrink-0">
                    <Download className="w-4 h-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}
