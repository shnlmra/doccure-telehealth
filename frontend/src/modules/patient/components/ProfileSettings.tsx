import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Check } from 'lucide-react';

interface ProfileProps {
  apiUrl: string;
  patientId: string;
}

export default function ProfileSettings({ apiUrl, patientId }: ProfileProps) {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1 (555) 019-2834',
    gender: 'Male',
    dateOfBirth: '1990-05-15',
    medicalHistory: 'Penicillin allergy, seasonal asthma.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/patients/${patientId}`);
        if (res.ok) {
          const data = await res.ok ? await res.json() : null;
          if (data) setProfile(data);
        }
      } catch (e) {
        console.warn('Could not load profile from API, using defaults.', e);
      } finally {
        setLoading(false);
      }
    };
    if (patientId && patientId !== 'mock-patient-uuid-1234') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [apiUrl, patientId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  if (loading) return <div>Loading patient profile...</div>;

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '650px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}>
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Patient Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review or edit your clinical identity details</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-input"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" disabled className="form-input" value={profile.email} style={{ opacity: 0.7 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={14} style={{ color: 'var(--warning)' }} /> Clinical History / Allergies
          </label>
          <textarea
            className="form-input"
            rows={3}
            value={profile.medicalHistory}
            onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
            placeholder="E.g. penicillin allergy, family asthma, chronic back pain"
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: '150px' }}>
          {saving ? 'Saving...' : saved ? (
            <>
              <Check size={16} /> Saved!
            </>
          ) : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
