interface MarkdownContentProps {
  text: string;
}

export default function MarkdownContent({ text }: MarkdownContentProps) {
  if (!text) return null;

  return text.split('\n').map((line, idx) => {
    if (line.startsWith('### ')) {
      return <h3 key={idx} className="text-[#0b2341] font-display font-extrabold text-xl md:text-2xl mt-8 mb-3 border-b pb-2 border-[#b68a2a]/35">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('#### ')) {
      return <h4 key={idx} className="text-clcs-maroon font-extrabold text-sm mt-6 mb-2 uppercase tracking-wide border-l-4 border-clcs-gold pl-3">{line.replace('#### ', '')}</h4>;
    }
    if (line.startsWith('- ')) {
      return <li key={idx} className="text-sm text-slate-700 ml-5 list-disc mt-2 leading-7 marker:text-clcs-gold">{line.replace('- ', '')}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={idx} className="text-sm text-slate-700 ml-5 list-decimal mt-2 leading-7 marker:text-clcs-maroon marker:font-bold">{line.replace(/^\d+\.\s/, '')}</li>;
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-4 border-[#b68a2a] bg-[#f7f4ee] p-5 pl-5 rounded-r-xl my-5 font-serif italic text-sm leading-7 text-slate-700 shadow-sm">
          {line.replace('> ', '')}
        </blockquote>
      );
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-3" />;
    }

    return (
      <p key={idx} className="text-sm md:text-[15px] text-slate-600 mt-3 leading-7 text-left sm:text-justify">
        {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-950">{part}</strong> : part)}
      </p>
    );
  });
}
