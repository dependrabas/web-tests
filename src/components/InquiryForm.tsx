import { FormEvent, ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface InquiryFields {
  email: string;
  message: string;
  name: string;
  phone: string;
  subject: string;
}

interface InquiryFormProps {
  fields: InquiryFields;
  mode: 'admissions' | 'contact';
  onChange: <K extends keyof InquiryFields>(field: K, value: InquiryFields[K]) => void;
  onResetSuccess?: () => void;
  onSubmit: (event: FormEvent) => void;
  success: string;
}

export default function InquiryForm({
  fields,
  mode,
  onChange,
  onResetSuccess,
  onSubmit,
  success
}: InquiryFormProps) {
  if (success) {
    return mode === 'admissions' ? (
      <div className="p-4 bg-slate-50 text-slate-700 text-xs rounded-lg border border-slate-200 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-[#b68a2a] mx-auto animate-bounce" />
        <p className="font-bold">Inquiry Sent!</p>
        <p className="font-light">{success}</p>
        {onResetSuccess && (
          <button onClick={onResetSuccess} className="bg-[#0b2341] text-white px-3 py-1 text-[10px] font-bold rounded cursor-pointer">
            Send another
          </button>
        )}
      </div>
    ) : (
      <div className="p-4 bg-slate-50 text-slate-700 text-xs rounded-xl border border-slate-200">
        <p className="font-bold">Ticket Filed Successfully!</p>
        <p className="mt-1">{success}</p>
      </div>
    );
  }

  if (mode === 'admissions') {
    return (
      <form onSubmit={onSubmit} className="space-y-3 text-xs">
        <Field label="Full Name *">
          <input
            type="text"
            value={fields.name}
            onChange={(event) => onChange('name', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white"
            placeholder="e.g. Jigme Tobgay"
            required
          />
        </Field>
        <Field label="Email Address *">
          <input
            type="email"
            value={fields.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white"
            placeholder="e.g. jigme@gmail.com"
            required
          />
        </Field>
        <Field label="Mobile Phone">
          <input
            type="text"
            value={fields.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white"
            placeholder="+975-17XXXXXX"
          />
        </Field>
        <Field label="Select Programme Category">
          <select
            value={fields.subject}
            onChange={(event) => onChange('subject', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white bg-no-repeat"
          >
            <option value="BA in Language and Heritage Studies">BA in Language & Heritage</option>
            <option value="BA in Bhutan Studies and Global Perspectives">BA in Bhutan Studies</option>
            <option value="BA in Cultural Innovation & Entrepreneurship">BA in Cultural Innovation</option>
            <option value="BA in History and Global Affairs">BA in History & Global Affairs</option>
            <option value="BA in Psychology and Mindfulness Studies">BA in Psychology & Mindfulness Studies</option>
            <option value="General Admissions inquiry">Other Admission doubt</option>
          </select>
        </Field>
        <Field label="Your Inquiry Message *">
          <textarea
            value={fields.message}
            onChange={(event) => onChange('message', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 h-20 bg-white"
            placeholder="Please state your Class XII marks details..."
            required
          />
        </Field>
        <button
          type="submit"
          className="w-full bg-[#0b2341] hover:bg-[#7a1f2b] text-white font-bold py-2 rounded text-xs uppercase tracking-wide cursor-pointer transition-colors"
        >
          File inquiry Ticket
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name *">
          <input
            type="text"
            value={fields.name}
            onChange={(event) => onChange('name', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white text-xs"
            placeholder="Enter your full name"
            required
          />
        </Field>
        <Field label="Email Address *">
          <input
            type="email"
            value={fields.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white text-xs"
            placeholder="name@example.com"
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Phone Number">
          <input
            type="text"
            value={fields.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white text-xs"
            placeholder="+975-17XXXXXX"
          />
        </Field>
        <Field label="Inquiry Category *">
          <select
            value={fields.subject}
            onChange={(event) => onChange('subject', event.target.value)}
            className="w-full min-w-0 border rounded mt-1 p-2 bg-white bg-no-repeat"
          >
            <option value="General public inquiry">General public inquiry</option>
            <option value="Admissions and programmes">Admissions and academic programmes</option>
            <option value="Partnerships and collaboration">Partnerships and collaboration</option>
            <option value="Media and communications">Media and communications</option>
            <option value="Campus visit and location">Campus visit and location</option>
            <option value="Alumni and community">Alumni and community</option>
            <option value="Other inquiry">Other inquiry</option>
          </select>
        </Field>
      </div>
      <Field label="Message *">
        <textarea
          value={fields.message}
          onChange={(event) => onChange('message', event.target.value)}
          className="w-full min-w-0 border rounded mt-1 p-2 h-32 bg-white text-xs"
          placeholder="Please describe your inquiry clearly, including any relevant context or preferred follow-up."
          required
        />
      </Field>
      <button
        type="submit"
        className="bg-[#0b2341] hover:bg-[#7a1f2b] text-white font-bold py-2.5 px-6 rounded text-xs uppercase cursor-pointer tracking-wider"
      >
        Submit Inquiry
      </button>
    </form>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block min-w-0 font-bold">
      {label}
      {children}
    </label>
  );
}
