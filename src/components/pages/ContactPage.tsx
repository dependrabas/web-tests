import { Mail, MapPin, PhoneCall } from 'lucide-react';
import { FormEvent } from 'react';
import InquiryForm, { InquiryFields } from '../InquiryForm';
import { ContactInfo } from '../../types';

interface ContactPageProps {
  contact: ContactInfo;
  inquiryFields: InquiryFields;
  inquirySuccess: string;
  onInquiryChange: <K extends keyof InquiryFields>(field: K, value: InquiryFields[K]) => void;
  onInquirySubmit: (event: FormEvent) => void;
}

export default function ContactPage({
  contact,
  inquiryFields,
  inquirySuccess,
  onInquiryChange,
  onInquirySubmit
}: ContactPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="border-b pb-4">
        <h2 className="text-[#0b2341] font-display font-extrabold text-xl sm:text-2xl font-sans">Contact and Location map</h2>
        <p className="text-xs text-gray-500 mt-1">Get physical path direction coordinates to our high-altitude school in Taktse, Trongsa.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2 bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-4 min-w-0">
          <h3 className="font-display font-extrabold text-[#0b2341] text-base">File a Public Inquiry Request</h3>
          <p className="text-xs text-gray-500">For visitors, parents, partners, alumni, and community members. Your message will be routed to the appropriate college office.</p>
          <InquiryForm fields={inquiryFields} mode="contact" onChange={onInquiryChange} onSubmit={onInquirySubmit} success={inquirySuccess} />
        </section>
        <aside className="space-y-6 min-w-0">
          <div className="bg-[#0b2341]/5 rounded-xl p-5 sm:p-6 border border-[#aabaca]/20 text-xs text-slate-700 space-y-3">
            <h4 className="font-display font-extrabold text-[#0b2341] text-sm">Trongsa College registry Head office</h4>
            <div className="space-y-3 break-words">
              <p className="flex items-start gap-2"><MapPin className="w-5 h-5 text-clcs-maroon shrink-0" /><span>{contact.address}</span></p>
              <p className="flex items-start gap-2"><PhoneCall className="w-5 h-5 text-[#b68a2a] shrink-0" /><span>{contact.phone}</span></p>
              <p className="flex items-start gap-2"><Mail className="w-5 h-5 text-[#0b2341] shrink-0" /><span>{contact.email}</span></p>
            </div>
            <hr className="border-slate-300" />
            <p className="text-[10px] text-gray-500 italic">Working Hours: {contact.workingHours}</p>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm h-64 bg-slate-200">
            <iframe
              src={contact.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Trongsa College Google maps location link"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
