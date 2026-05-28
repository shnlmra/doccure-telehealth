import React, { useState, useEffect } from 'react';
import { Search, Star, DollarSign, Calendar, RefreshCw } from 'lucide-react';

interface Doctor {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  experience?: number;
  consultationFee?: number;
  rating?: number;
  biography?: string;
  bio?: string;
}

interface DoctorDiscoveryProps {
  apiUrl: string;
  onSelectDoctor: (doctor: Doctor) => void;
}

export default function DoctorDiscovery({ apiUrl, onSelectDoctor }: DoctorDiscoveryProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/doctors`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (e) {
      console.warn('Could not fetch doctors from API, applying mock fallback.');
      setDoctors([
        {
          id: 'mock-doctor-uuid-1',
          firstName: 'Sarah',
          lastName: 'Connor',
          specialization: 'Cardiologist',
          experience: 12,
          consultationFee: 150.0,
          rating: 4.9,
          biography: 'Expert in pediatric cardiology and structural heart diseases.'
        },
        {
          id: 'mock-doctor-uuid-2',
          firstName: 'Robert',
          lastName: 'Chen',
          specialization: 'Dermatologist',
          experience: 8,
          consultationFee: 95.0,
          rating: 4.7,
          biography: 'Specializes in allergy management, eczema treatments, and clinical dermatology.'
        },
        {
          id: 'mock-doctor-uuid-3',
          firstName: 'Elena',
          lastName: 'Rostova',
          specialization: 'General Physician',
          experience: 15,
          consultationFee: 75.0,
          rating: 4.9,
          biography: 'Comprehensive family medicine and diagnostic medical services.'
        },
        {
          id: 'mock-doctor-uuid-4',
          firstName: 'Marcus',
          lastName: 'Vance',
          specialization: 'Urologist',
          experience: 10,
          consultationFee: 120.0,
          rating: 4.6,
          biography: 'Specialized in minimally invasive surgical procedures and urinary wellness.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [apiUrl]);

  const filteredDoctors = doctors.filter((doc) => {
    const fullName = (doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`).trim().toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = selectedSpecialization === 'All' || doc.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  const specializations = ['All', ...Array.from(new Set(doctors.map((d) => d.specialization)))];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Find Doctors</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Browse our network of certified clinicians</p>
        </div>
        <button onClick={fetchDoctors} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <RefreshCw size={16} /> Reload Network
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{
        padding: '16px',
        marginBottom: '30px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          flex: '1',
          minWidth: '240px',
          backgroundColor: 'var(--background)'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
          />
        </div>

        {/* Specialization Filter */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.85rem',
                borderRadius: '999px',
                backgroundColor: selectedSpecialization === spec ? 'var(--primary-light)' : 'var(--card-bg)',
                color: selectedSpecialization === spec ? 'var(--primary)' : 'var(--text-secondary)',
                border: selectedSpecialization === spec ? '1px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div>Loading specialist directory...</div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No doctors match your filtering criteria.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {doc.name 
                      ? doc.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : `${doc.firstName?.[0] || ''}${doc.lastName?.[0] || ''}` || 'DR'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <Star size={14} fill="var(--warning)" /> {doc.rating || 4.8}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '4px' }}>
                  Dr. {doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Clinician'}
                </h3>
                <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
                  {doc.specialization}
                </span>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {doc.bio || doc.biography || 'Consulting clinician at Doccure virtual medical network.'}
                </p>
              </div>

              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consultation Fee</div>
                  <div style={{ fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                    <DollarSign size={14} />{doc.consultationFee || 100}
                  </div>
                </div>
                <button onClick={() => onSelectDoctor(doc)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Calendar size={14} /> Schedule Consult
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
