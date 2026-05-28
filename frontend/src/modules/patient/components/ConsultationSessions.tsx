import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Send, MessageSquare, ShieldCheck } from 'lucide-react';

interface ConsultationSessionsProps {
  doctorName?: string;
}

export default function ConsultationSessions({ doctorName = 'Dr. Sarah Connor' }: ConsultationSessionsProps) {
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: 'patient' | 'doctor'; text: string; time: string }[]>([
    { sender: 'doctor', text: 'Hello John! How are you feeling today?', time: '09:01 AM' },
    { sender: 'patient', text: 'Hi doctor, I am feeling a bit feverish and have minor joint stiffness.', time: '09:02 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: 'patient', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setNewMessage('');

    // Mock quick doctor automated answer
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'doctor',
          text: 'Got it. Let me review your medical history and AI symptom report. We will log this in your file.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    }, 1500);
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
      
      {/* Session Title */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--card-bg)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Active Consultation Session</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consulting with <strong>{doctorName}</strong></p>
        </div>
        <span className="badge badge-success" style={{ gap: '4px' }}>
          <ShieldCheck size={14} /> Encrypted Call
        </span>
      </div>

      {!inCall ? (
        /* Lobby */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Video size={40} />
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Waiting Room</h4>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Your doctor is online. Prepare your microphone, camera, and join the secure consultation.
          </p>
          <button onClick={() => setInCall(true)} className="btn btn-primary" style={{ padding: '12px 30px' }}>
            Join Call Session
          </button>
        </div>
      ) : (
        /* Video Screen & Chat Split */
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          
          {/* Left: Video Area */}
          <div style={{
            flex: '2',
            position: 'relative',
            backgroundColor: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px'
          }}>
            {/* Main Feed (Doctor) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {videoActive ? (
                /* Simulated Doctor Feed */
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  fontSize: '1rem',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    marginBottom: '15px'
                  }}>
                    {doctorName.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <span>{doctorName} (Live Feed)</span>
                </div>
              ) : (
                <div style={{ color: '#fff' }}>Doctor camera is turned off</div>
              )}
            </div>

            {/* PIP Feed (Patient Self View) */}
            <div style={{
              position: 'absolute',
              bottom: '90px',
              right: '20px',
              width: '140px',
              height: '95px',
              backgroundColor: '#334155',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid #fff',
              zIndex: 10,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem'
            }}>
              {videoActive ? 'You (Camera Active)' : 'Camera Muted'}
            </div>

            {/* Video Controls Bar */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '10px 20px',
              borderRadius: '9999px',
              display: 'flex',
              gap: '15px',
              zIndex: 10,
              backdropFilter: 'blur(8px)'
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <PhoneOff size={18} />
              </button>
            </div>
          </div>

          {/* Right: Chat Panel */}
          <div style={{
            flex: '1',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--card-bg)'
          }}>
            {/* Messages */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
                <MessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }} /> Live Session Chat
              </div>
              
              {chatMessages.map((msg, i) => {
                const isPatient = msg.sender === 'patient';
                return (
                  <div key={i} style={{
                    alignSelf: isPatient ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isPatient ? 'var(--primary-light)' : 'var(--background)',
                    color: isPatient ? 'var(--primary)' : 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}>
                    <div>{msg.text}</div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', textAlign: isPatient ? 'right' : 'left' }}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{
              padding: '12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Type message..."
                className="form-input"
                style={{ padding: '8px 12px' }}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}
