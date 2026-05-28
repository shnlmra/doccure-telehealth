import React, { useState, useEffect } from 'react';
import { Search, FileText, Calendar, Pill, RefreshCw, UserCheck } from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface ConsultationNote {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  diagnosis: string;
  notes?: string;
  prescriptions: Prescription[];
}

interface PatientRecordsAccessProps {
  apiUrl: string;
  doctorId: string;
}

export default function PatientRecordsAccess({ apiUrl, doctorId }: PatientRecordsAccessProps) {
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string; email: string; medicalHistory?: string }[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useState<ConsultationNote[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await fetch(`${apiUrl}/patients`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.warn('Could not load patients list from API. Fallback mock list.');
      setPatients([
        { id: 'mock-patient-uuid-1234', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', medicalHistory: 'Penicillin allergy, seasonal asthma.' },
        { id: 'mock-patient-uuid-5678', firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@example.com', medicalHistory: 'No known allergies.' }
      ]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${apiUrl}/doctors/${doctorId}/patients/${patientId}/history`);
      if (res.ok) {
        const data = await res.json();
        setPatientHistory(data);
      }
    } catch (e) {
      console.warn('Could not fetch patient clinical history, fallback mock timeline.');
      setPatientHistory([
        {
          id: 'h1',
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
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [apiUrl]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatient(id);
    fetchHistory(id);
  };

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const activePatientInfo = patients.find(p => p.id === selectedPatient);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }} className="animate-fade-in">
      
      {/* Left: Patient List */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Patient Records</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Select a registered patient to review clinical history files.</p>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            marginBottom: '16px',
            backgroundColor: 'var(--background)'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          {loadingPatients ? (
            <div>Syncing profiles...</div>
          ) : filteredPatients.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No patients found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredPatients.map((p) => {
                const isSelected = p.id === selectedPatient;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--ai-accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--ai-accent-light)' : 'var(--card-bg)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isSelected ? 'var(--ai-accent)' : 'var(--text-primary)' }}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {p.email}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Medical History Timeline */}
      <div>
        {selectedPatient && activePatientInfo ? (
          <div>
            {/* Header info */}
            <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: 'var(--primary)' }} /> {activePatientInfo.firstName} {activePatientInfo.lastName}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Email: <strong>{activePatientInfo.email}</strong></p>
              
              {activePatientInfo.medicalHistory && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--warning-light)',
                  color: 'var(--warning)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  Pre-existing Conditions / Allergies: {activePatientInfo.medicalHistory}
                </div>
              )}
            </div>

            {/* History logs */}
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Clinical Timeline Records</h4>

            {loadingHistory ? (
              <div>Retrieving files...</div>
            ) : patientHistory.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                <FileText size={30} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
                No past consultations logged for this patient.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '15px', borderLeft: '2px solid var(--border)' }}>
                {patientHistory.map((note) => (
                  <div key={note.id} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ai-accent)',
                      border: '3px solid var(--background)'
                    }} />

                    <div className="card" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(note.createdAt).toLocaleDateString()}</span>
                        <strong>Diagnosed</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '15px', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Complaint</strong>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{note.chiefComplaint}</span>
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Diagnosis</strong>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{note.diagnosis}</span>
                        </div>
                      </div>

                      {note.notes && (
                        <div style={{ padding: '8px', fontSize: '0.8rem', backgroundColor: 'var(--background)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                          <strong>Doctor Notes:</strong> {note.notes}
                        </div>
                      )}

                      {/* Prescriptions */}
                      {note.prescriptions && note.prescriptions.length > 0 && (
                        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Pill size={12} style={{ color: 'var(--danger)' }} /> Prescribed Rx
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {note.prescriptions.map((p) => (
                              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--card-bg)' }}>
                                <span><strong>{p.medicationName}</strong> ({p.dosage})</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{p.frequency} &bull; {p.duration}</span>
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
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-secondary)' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
            <h4>No Patient Selected</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Please choose a patient profile from the directory on the left to display historical files.</p>
          </div>
        )}
      </div>

    </div>
  );
}
