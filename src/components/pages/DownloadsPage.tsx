import { BookOpen, Download } from 'lucide-react';
import { DownloadItem } from '../../types';

interface DownloadsPageProps {
  activeCategoryFilter: string;
  downloads: DownloadItem[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const categories = ['All', 'academic-calendar', 'admission-forms', 'research-forms', 'student-handbook'];

export default function DownloadsPage({
  activeCategoryFilter,
  downloads,
  onCategoryChange,
  onSearchChange,
  searchQuery
}: DownloadsPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-[#0b2341] font-display font-extrabold text-xl sm:text-2xl">Institutional Downloads Registry</h2>
        <p className="text-xs text-gray-500 mt-1">Direct verification of calendar files, admissions guidelines PDF, and scholarship checklists.</p>
      </div>
      <div className="bg-white p-4 border rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full font-semibold cursor-pointer ${
                activeCategoryFilter === category ? 'bg-[#0b2341] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {category.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search file name catalog..."
          className="w-full md:w-64 text-xs border rounded p-1.5 bg-white"
        />
      </div>
      <div className="grid gap-3 md:hidden">
        {downloads.map((download) => (
          <article key={download.id} className="bg-white border rounded-xl p-4 shadow-sm min-w-0">
            <div className="flex gap-3 items-start">
              <BookOpen className="w-4 h-4 text-clcs-navy mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs text-slate-900">{download.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                  <span className="uppercase text-[#7a1f2b] font-bold">{download.category}</span>
                  <span className="font-mono text-slate-500">{download.fileSize}</span>
                </div>
              </div>
            </div>
            <a href={download.fileUrl} className="mt-3 inline-flex items-center gap-1 bg-[#0b2341] text-white hover:bg-[#7a1f2b] transition rounded text-[10px] font-bold py-1.5 px-3 uppercase">
              <Download className="w-3 h-3" /> Get File Attachment
            </a>
          </article>
        ))}
      </div>
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b text-slate-700 font-bold">
              <th className="p-4 uppercase">Document File Name</th>
              <th className="p-4 uppercase">Folder</th>
              <th className="p-4 uppercase">Size</th>
              <th className="p-4 uppercase">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-750">
            {downloads.map((download) => (
              <tr key={download.id} className="hover:bg-[#f7f4ee]/20">
                <td className="p-4 font-bold text-slate-900">
                  <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-clcs-navy shrink-0" /> {download.title}</span>
                </td>
                <td className="p-4 uppercase text-[#7a1f2b] font-bold text-[10px]">{download.category}</td>
                <td className="p-4 font-mono">{download.fileSize}</td>
                <td className="p-4">
                  <a href={download.fileUrl} className="bg-[#0b2341] text-white hover:bg-[#7a1f2b] transition rounded text-[10px] font-bold py-1.5 px-3 uppercase">
                    Get File Attachment
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
