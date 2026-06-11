import { Download, ExternalLink, Linkedin, Mail, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StaffProfile } from '../types';

interface ProfileDirectoryProps {
  emptyText: string;
  profiles: StaffProfile[];
  title: string;
}

export default function ProfileDirectory({ emptyText, profiles, title }: ProfileDirectoryProps) {
  const [selectedProfile, setSelectedProfile] = useState<StaffProfile | null>(null);

  useEffect(() => {
    if (!selectedProfile) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProfile(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedProfile]);

  return (
    <div className="profile-directory">
      <h3 className="profile-directory-title">{title}</h3>
      {profiles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          {emptyText}
        </p>
      ) : (
        <div className="profile-grid">
          {profiles.map((profile) => (
            <article key={profile.id} className="profile-card">
              <ProfileAvatar profile={profile} size="card" />
              <h4 className="profile-card-name">{profile.name}</h4>
              <p className="profile-card-role">{profile.designation}</p>
              <p className="profile-card-department">{profile.department}</p>
              <button type="button" onClick={() => setSelectedProfile(profile)} className="profile-card-button">
                View Profile
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedProfile && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={() => setSelectedProfile(null)}>
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="profile-modal-close" onClick={() => setSelectedProfile(null)} aria-label="Close profile">
              <X className="h-6 w-6" />
            </button>

            <div className="profile-modal-header">
              <ProfileAvatar profile={selectedProfile} size="modal" />
              <h3 id="profile-modal-title" className="profile-modal-name">{selectedProfile.name}</h3>
              <p className="profile-modal-role">{selectedProfile.designation}</p>
              <p className="profile-modal-department">{selectedProfile.department}</p>
            </div>

            <div className="profile-modal-body">
              <h4>About</h4>
              <p>{selectedProfile.bio || 'No biography has been published for this profile yet.'}</p>

              <div className="profile-modal-contact">
                <h4>Contact Information</h4>
                <dl>
                  {selectedProfile.phone && (
                    <div>
                      <dt><Phone className="h-4 w-4" /> Phone:</dt>
                      <dd><a href={`tel:${selectedProfile.phone}`}>{selectedProfile.phone}</a></dd>
                    </div>
                  )}
                  {selectedProfile.email && (
                    <div>
                      <dt><Mail className="h-4 w-4" /> Email:</dt>
                      <dd><a href={`mailto:${selectedProfile.email}`}>{selectedProfile.email}</a></dd>
                    </div>
                  )}
                </dl>
              </div>

              {(selectedProfile.linkedInUrl || selectedProfile.cvUrl || selectedProfile.researchUrl) && (
                <div className="profile-modal-links">
                  {selectedProfile.linkedInUrl && (
                    <a href={selectedProfile.linkedInUrl} target="_blank" rel="noreferrer">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                  {selectedProfile.cvUrl && (
                    <a href={selectedProfile.cvUrl} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" /> CV
                    </a>
                  )}
                  {selectedProfile.researchUrl && (
                    <a href={selectedProfile.researchUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" /> Research
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function ProfileAvatar({ profile, size }: { profile: StaffProfile; size: 'card' | 'modal' }) {
  const sizeClass = size === 'modal' ? 'profile-avatar profile-avatar-modal' : 'profile-avatar';

  return profile.image ? (
    <img src={profile.image} alt={profile.name} className={sizeClass} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
  ) : (
    <span className={sizeClass}>
      {profile.name.charAt(0)}
    </span>
  );
}
