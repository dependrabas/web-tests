import { GalleryItem } from '../../types';

interface GalleryPageProps {
  gallery: GalleryItem[];
  lightboxImage: string | null;
  onCloseLightbox: () => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export default function GalleryPage({ gallery, lightboxImage, onCloseLightbox, onOpenLightbox }: GalleryPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-[#0b2341] font-display font-extrabold text-xl sm:text-2xl font-sans">Visual Campus Memories Gallery</h2>
        <p className="text-xs text-gray-500 mt-1">Explore pristine architectural spaces, debate ceremonies and mountain-side residential yards in Taktse.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {gallery.map((item) => (
          <button key={item.id} onClick={() => onOpenLightbox(item.imageUrl)} className="bg-white border hover:border-[#b68a2a] p-2.5 rounded-xl cursor-pointer shadow-sm group transform hover:-translate-y-1 duration-150 text-left min-w-0">
            <span className="block overflow-hidden rounded-lg bg-slate-200">
              <img src={item.imageUrl} className="w-full h-44 object-cover object-center group-hover:scale-105 duration-300" alt={item.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
            </span>
            <span className="block mt-3 text-xs">
              <span className="bg-[#0b2341]/5 text-[#0b2341] font-extrabold text-[8px] px-1.5 rounded uppercase">{item.category}</span>
              <span className="block font-bold text-slate-850 mt-1 line-clamp-1">{item.title}</span>
            </span>
          </button>
        ))}
      </div>
      {lightboxImage && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-2 sm:p-4 z-[100] cursor-pointer" onClick={onCloseLightbox}>
          <div className="relative w-full max-w-4xl max-h-[86vh] bg-white p-2 rounded-xl">
            <img src={lightboxImage} className="mx-auto max-w-full max-h-[76vh] rounded object-contain" alt="Selected gallery view" decoding="async" referrerPolicy="no-referrer" />
            <p className="text-slate-400 text-center text-[10px] mt-2">Click anywhere to return to Photo Gallery</p>
          </div>
        </div>
      )}
    </div>
  );
}
