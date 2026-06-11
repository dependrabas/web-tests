import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, MapPinned, PlayCircle } from 'lucide-react';
import { HomepageSlider } from '../types';

interface HeroSliderProps {
  sliders: HomepageSlider[];
  onCTA: (link: string) => void;
}

export default function HeroSlider({ sliders, onCTA }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliders.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [sliders]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % sliders.length);
  };

  if (!sliders || sliders.length === 0) return null;

  const activeSlide = sliders[currentIdx];
  const mediaUrl = activeSlide.videoUrl || activeSlide.imageUrl;
  const isVideoSlide = isVideoMedia(mediaUrl);

  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[620px] md:min-h-[680px] overflow-hidden bg-slate-950 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.04, filter: 'blur(16px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.985, filter: 'blur(18px)' }}
          transition={{ duration: 1.05, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Main Visual Media Backdrop */}
          {isVideoSlide ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              className="w-full h-full object-cover object-center filter brightness-[0.74] contrast-[1.08] saturate-[1.12]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.74] contrast-[1.08] saturate-[1.12]"
              decoding="async"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,23,43,0.94)_0%,rgba(11,35,65,0.72)_46%,rgba(122,31,43,0.16)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(182,138,42,0.22),transparent_22rem)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7f4ee] via-[#f7f4ee]/72 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-8 pt-6 sm:pt-10">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-center">
              <div className="text-center md:text-left space-y-5">
              <motion.h2
                key={`${activeSlide.id}-title`}
                initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
                transition={{ delay: 0.2, duration: 0.68, ease: 'easeOut' }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white leading-[1.05] sm:leading-[1.02] drop-shadow-md max-w-5xl"
              >
                {activeSlide.title}
              </motion.h2>

              <motion.p
                key={`${activeSlide.id}-subtitle`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: 0.3, duration: 0.55, ease: 'easeOut' }}
                className="text-sm sm:text-base md:text-lg text-slate-100 max-w-2xl font-medium leading-relaxed drop-shadow-sm"
              >
                {activeSlide.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="pt-2 sm:pt-3 flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start"
              >
                {activeSlide.ctaEnabled !== false && (
                  <button
                    onClick={() => onCTA(activeSlide.ctaLink)}
                    className="bg-clcs-gold text-clcs-navy hover:bg-white transition-all font-extrabold text-sm py-3.5 px-6 rounded-lg shadow-xl shadow-black/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{activeSlide.ctaText || "Explore"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {activeSlide.virtualTourEnabled !== false && (
                  <button
                    onClick={() => onCTA('/contact')}
                    className="bg-white/12 border border-white/35 text-white hover:bg-white/20 hover:border-white transition-all font-bold text-sm py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer backdrop-blur"
                  >
                    <PlayCircle className="w-4 h-4 text-clcs-gold" />
                    <span>Virtual Tour</span>
                  </button>
                )}
              </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="hidden lg:block rounded-2xl border border-white/18 bg-white/12 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-white/15 pb-4">
                  <div className="h-11 w-11 rounded-xl bg-clcs-gold text-clcs-navy flex items-center justify-center">
                    <MapPinned className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[#e6d4ac] font-bold">Campus Setting</p>
                    <p className="text-sm text-white/85">Taktse, Trongsa</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <HeroMetric value="5" label="Bachelor pathways" />
                  <HeroMetric value="1961" label="Academic legacy" />
                  <HeroMetric value="RUB college" label="Constituent" />
                  <HeroMetric value="GNH" label="Learning values" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Control Buttons (Only if more than 1 slide) */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/12 border border-white/20 hover:bg-white/24 transition cursor-pointer text-white hidden sm:block backdrop-blur"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/12 border border-white/20 hover:bg-white/24 transition cursor-pointer text-white hidden sm:block backdrop-blur"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Bullets */}
          <div className="absolute bottom-5 sm:bottom-8 left-0 right-0 flex justify-center gap-2">
            {sliders.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIdx ? 'bg-clcs-gold w-7' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function isVideoMedia(url = '') {
  const normalizedUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return url.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|m4v)$/.test(normalizedUrl);
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 border border-white/12">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] uppercase text-slate-200 font-bold leading-tight mt-1">{label}</div>
    </div>
  );
}
