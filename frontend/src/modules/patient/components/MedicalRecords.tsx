import React, { useState, useEffect } from 'react';
import { Clipboard, ShieldAlert, FileText, Pill, Calendar, RefreshCw } from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface MedicalRecord {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  diagnosis: string;
  notes?: string;
  prescriptions: Prescription[];
}

interface MedicalRecordsProps {
  apiUrl: string;
  patientId: string;
}

export default function MedicalRecords({ apiUrl, patientId }: MedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/patients/${patientId}/medical-records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.warn('Could not fetch medical history from API, fallback to mock history.');
      setRecords([
        {
          id: 'mock-rec-1',
          createdAt: new Date().toISOString(),
          chiefComplaint: 'Mild dry cough, seasonal chest tightness.',
          diagnosis: 'Acute Bronchitis (mild stage)',
          notes: 'Patient advised to steam inhale, hydrate, and complete the prescribed antibiotic cycle.',
          prescriptions: [
            { id: 'p1', medicationName: 'Amoxicillin', dosage: '500mg', frequency: 'Three times a day', duration: '7 days' },
            { id: 'p2', medicationName: 'Dextromethorphan (Cough Syrup)', dosage: '10ml', frequency: 'Every 8 hours as needed', duration: '5 days' }
          ]
        },
        {
          id: 'mock-rec-2',
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          chiefComplaint: 'Persistent skin rash and itching on lower forearms.',
          diagnosis: 'Contact Dermatitis',
          notes: 'Identified allergy to laundry detergent. Apply topical cream.',
          prescriptions: [
            { id: 'p3', medicationName: 'Hydrocortisone 1% Cream', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '10 days' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [apiUrl, patientId]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Medical History & Records</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your digital clinical history portfolio</p>
        </div>
        <button onClick={fetchRecords} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <RefreshCw size={16} /> Sync Files
        </button>
      </div>

      {loading ? (
        <div>Syncing clinical folders...</div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <FileText size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <p>No logged medical records found.</p>
          <p style={{ fontSize: '0.8rem' }}>Once a doctor completes a consultation session, your notes and prescriptions will display here.</p>
        </div>
      ) : (
        /* Timeline List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border)' }}>
          {records.map((rec) => (
            <div key={rec.id} style={{ position: 'relative' }}>
              
              {/* Dot indicator on timeline */}
              <div style={{
                position: 'absolute',
                left: '-29px',
                top: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                border: '4px solid var(--background)'
              }} />

              {/* Record Detail Card */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Calendar size={14} /> {new Date(rec.createdAt).toLocaleDateString()} - {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className="badge badge-success">Consultation Completed</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '16px' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Chief Complaint</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rec.chiefComplaint}</p>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Clinical Diagnosis</strong>
                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{rec.diagnosis}</p>
                  </div>
                </div>

                {rec.notes && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--background)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    borderLeft: '3px solid var(--primary)'
                  }}>
                    <strong>Doctor Notes:</strong> {rec.notes}
                  </div>
                )}

                {/* Prescriptions Sub-section */}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Pill size={14} style={{ color: 'var(--danger)' }} /> Prescribed Medications
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {rec.prescriptions.map((p) => (
                        <div key={p.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: '0.8rem',
                          backgroundColor: 'var(--card-bg)'
                        }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{p.medicationName}</strong>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({p.dosage})</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            {p.frequency} &bull; <strong style={{ color: 'var(--text-primary)' }}>{p.duration}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
