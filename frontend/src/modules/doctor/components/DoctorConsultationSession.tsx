import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Clipboard, ShieldCheck } from 'lucide-react';
import ClinicalNotesBuilder from './ClinicalNotesBuilder';

interface DoctorConsultationSessionProps {
  apiUrl: string;
  doctorId: string;
  onSessionComplete: () => void;
}

export default function DoctorConsultationSession({ apiUrl, doctorId, onSessionComplete }: DoctorConsultationSessionProps) {
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  // Mocks for current patient active in call
  const activePatient = {
    id: 'mock-patient-uuid-1234',
    name: 'John Doe',
    email: 'john.doe@example.com',
    appointmentId: 'mock-appointment-uuid-123'
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Active Consultation Session</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Currently consulting with patient: <strong>{activePatient.name}</strong></p>
        </div>
        <span className="badge badge-success" style={{ gap: '4px' }}>
          <ShieldCheck size={14} /> Secure Tunnel
        </span>
      </div>

      {!inCall ? (
        /* Lobby */
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--ai-accent-light)',
            color: 'var(--ai-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Video size={40} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Start Call Lobby</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Verify your camera and microphone levels before joining patient John Doe in the encrypted telehealth room.
          </p>
          <button onClick={() => setInCall(true)} className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Start Video consultation
          </button>
        </div>
      ) : (
        /* Video and Notes split layout */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '30px',
          height: '650px',
          alignItems: 'stretch'
        }}>
          
          {/* Left: Call Feed */}
          <div style={{
            position: 'relative',
            backgroundColor: '#0f172a',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px'
          }}>
            
            {/* Feed Screen */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e293b'
            }}>
              {videoActive ? (
                /* Patient Feed */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fff'
                }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.8rem',
                    marginBottom: '15px'
                  }}>
                    JD
                  </div>
                  <span style={{ fontSize: '0.95rem' }}>{activePatient.name} (Live Feed)</span>
                </div>
              ) : (
                <span style={{ color: '#fff' }}>Patient camera disabled</span>
              )}
            </div>

            {/* Self Feed PIP */}
            <div style={{
              position: 'absolute',
              bottom: '100px',
              right: '24px',
              width: '130px',
              height: '90px',
              backgroundColor: '#334155',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.7rem',
              zIndex: 10
            }}>
              You (Camera Active)
            </div>

            {/* Controls Bar */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '10px 20px',
              borderRadius: '9999px',
              display: 'flex',
              gap: '15px',
              backdropFilter: 'blur(8px)',
              zIndex: 10
            }}>
              <button
                onClick={() => setMicActive(!micActive)}
                style={{
                  border: 'none',
                  backgroundColor: micActive ? '#334155' : 'var(--danger)',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                onClick={() => setVideoActive(!videoActive)}
                style={{
                  border: 'none',
                  backgroundColor: videoActive ? '#334155' : 'var(--danger)',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                onClick={() => setInCall(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PhoneOff size={18} />
              </button>
            </div>

          </div>

          {/* Right: Diagnosis & Prescription Builder */}
          <div style={{ overflowY: 'auto' }}>
            <ClinicalNotesBuilder
              apiUrl={apiUrl}
              doctorId={doctorId}
              patientId={activePatient.id}
              appointmentId={activePatient.appointmentId}
              onSuccess={onSessionComplete}
            />
          </div>

        </div>
      )}

    </div>
  );
}
