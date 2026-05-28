'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Calendar, ClipboardList, Video, User, LogOut, Award, ShieldCheck, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import ProfileManagement from '@/modules/doctor/components/ProfileManagement';
import ScheduleManagement from '@/modules/doctor/components/ScheduleManagement';
import ClinicalNotesBuilder from '@/modules/doctor/components/ClinicalNotesBuilder';
import PatientRecordsAccess from '@/modules/doctor/components/PatientRecordsAccess';
import DoctorConsultationSession from '@/modules/doctor/components/DoctorConsultationSession';

type ActiveTab = 'dashboard' | 'schedule' | 'records' | 'session' | 'profile';

export default function DoctorDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  // Auth States
  const [doctor, setDoctor] = useState<{ id: string; email: string; userId: string } | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Login/Register Form State
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    name: 'Sarah Connor',
    specialization: 'Cardiologist',
    licenseNumber: 'MD-998877',
  });
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upcoming Appointments States
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  const fetchUpcomingAppointments = async () => {
    if (!doctor || !doctor.id || doctor.id.startsWith('mock-')) return;
    setLoadingUpcoming(true);
    try {
      const res = await fetch(`${apiUrl}/doctors/${doctor.id}/appointments/upcoming`);
      if (res.ok) {
        const data = await res.json();
        setUpcomingAppointments(data);
      }
    } catch (e) {
      console.warn('Could not fetch upcoming appointments', e);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  useEffect(() => {
    if (doctor && doctor.id && !doctor.id.startsWith('mock-')) {
      fetchUpcomingAppointments();

      const socketUrl = apiUrl.replace('/api', '');
      const socket = io(socketUrl, {
        query: { userId: doctor.userId },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('[DoctorDashboard] Connected to socket');
      });

      socket.on('schedule_updated', (data: { doctorId: string }) => {
        if (data.doctorId === doctor.id) {
          fetchUpcomingAppointments();
        }
      });

      socket.on('notification', () => {
        fetchUpcomingAppointments();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [apiUrl, doctor]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    setErrorMessage(null);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginData.email, password: loginData.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          const apiError = new Error(data.message || 'Login failed.');
          (apiError as any).isApiError = true;
          throw apiError;
        }

        if (data.user.profileId) {
          setDoctor({ id: data.user.profileId, email: data.user.email, userId: data.user.id });
          setHasProfile(true);
          setActiveTab('dashboard');
        } else {
          // Doctor has no profile yet! Redirect to profile config
          setDoctor({ id: '', email: data.user.email, userId: data.user.id });
          setHasProfile(false);
          setActiveTab('profile');
        }
      } else {
        // --- REGISTER FLOW ---
        const res = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginData.email, password: loginData.password, role: 'doctor' }),
        });
        const data = await res.json();
        if (!res.ok) {
          const apiError = new Error(data.message || 'Registration failed.');
          (apiError as any).isApiError = true;
          throw apiError;
        }

        // Redirect newly registered doctor to set up profile
        setDoctor({ id: '', email: data.email, userId: data.userId });
        setHasProfile(false);
        setActiveTab('profile');
      }
    } catch (err: any) {
      console.warn('Auth API failure.', err);
      setErrorMessage(err.message || 'Could not connect. Using local fallback.');
      
      // Only trigger local mock fallback if it is a network/connectivity error (not an API-returned error)
      if (!err.isApiError) {
        setTimeout(() => {
          setDoctor({ id: 'mock-doctor-uuid-1234', email: loginData.email || 'sarah.connor@example.com', userId: 'mock-user-id-567' });
          setHasProfile(true);
          setActiveTab('dashboard');
        }, 1000);
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleProfileUpdated = (profileId: string) => {
    if (doctor) {
      setDoctor({ ...doctor, id: profileId });
      setHasProfile(true);
    }
  };

  const handleSignOut = () => {
    setDoctor(null);
    setHasProfile(false);
    setActiveTab('dashboard');
  };

  if (!doctor) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 70%), var(--background)'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--ai-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              D
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Doccure
            </span>
          </Link>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Enter virtual clinician details or register to log in.
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="card" style={{ maxWidth: '450px', width: '100%' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
            {isLogin ? 'Doctor Portal Login' : 'Doctor Registration'}
          </h2>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 6 characters"
              className="form-input"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>

          {errorMessage && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>
              {errorMessage}
            </div>
          )}

          <button type="submit" disabled={loadingLogin} className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--ai-accent)' }}>
            {loadingLogin ? 'Authorizing...' : isLogin ? 'Access Workspace' : 'Register Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: 'var(--ai-accent)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? "Don't have a doctor account? Sign Up" : 'Already registered? Sign In'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Doctor Dashboard', icon: <Home size={18} />, disabled: !hasProfile },
    { id: 'schedule', label: 'Manage Schedule', icon: <Calendar size={18} />, disabled: !hasProfile },
    { id: 'records', label: 'Patient Medical Records', icon: <ClipboardList size={18} />, disabled: !hasProfile },
    { id: 'session', label: 'Consultation Sessions', icon: <Video size={18} />, disabled: !hasProfile },
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} />, disabled: false },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--ai-accent)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            D
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>Doccure Doctor</span>
        </div>

        {/* User Card */}
        <div style={{
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--ai-accent-light)',
            color: 'var(--ai-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            Dr
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hasProfile ? loginData.email.split('@')[0] : 'New Clinician'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctor.email}
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--ai-accent-light)' : 'transparent',
                  color: isActive ? 'var(--ai-accent)' : 'var(--text-secondary)',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.5 : 1,
                  fontWeight: isActive ? 'bold' : '500',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontWeight: '600',
            textAlign: 'left',
            marginTop: 'auto',
          }}
        >
          <LogOut size={18} />
          <span style={{ fontSize: '0.9rem' }}>Sign Out</span>
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        
        {/* Profile Warning banner */}
        {!hasProfile && (
          <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '24px', backgroundColor: 'var(--warning-light)', color: 'var(--text-primary)' }}>
            <h4 style={{ fontWeight: 'bold' }}>Profile Incomplete</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Please configure your name, specialization, and unique license credentials in the <strong>Profile Settings</strong> tab below to enable schedule publishing and session panels.</p>
          </div>
        )}

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && hasProfile && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Left Column */}
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Clinician Workspace</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Track clinical metrics, open schedule sessions, and handle patient charts.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--ai-accent-light)', color: 'var(--ai-accent)' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success)' }}>Active Clinician</div>
                  </div>
                </div>
                
                <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Check</div>
                    <span className="badge badge-success" style={{ gap: '4px', textTransform: 'none', marginTop: '4px' }}>
                      Verified Profile
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Next Steps</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                  Go to the <strong>Manage Schedule</strong> tab to configure your start and end timeslots. Patients will then be able to discover you in their directories and book consultations.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Once a patient books an appointment, it will instantly appear in the "Upcoming Appointments" side panel in real-time.
                </p>
              </div>
            </div>

            {/* Right Column: Upcoming Appointments Side Panel */}
            <div className="card" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--ai-accent)' }} />
                Upcoming Appointments
              </h3>
              
              {loadingUpcoming ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Syncing incoming bookings...</div>
              ) : upcomingAppointments.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 20px' }}>
                  <Clock size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>No upcoming bookings scheduled yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingAppointments.map((app: any) => (
                    <div key={app.id} style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{app.patient?.name || 'Patient'}</span>
                        <span className={`badge ${app.status === 'in_session' ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                          {app.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {app.schedule ? app.schedule.date : 'Unknown Date'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {app.schedule ? `${app.schedule.startTime} - ${app.schedule.endTime}` : 'Timeslot not set'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Manage Schedule */}
        {activeTab === 'schedule' && hasProfile && (
          <ScheduleManagement apiUrl={apiUrl} doctorId={doctor.id} />
        )}

        {/* TAB: Patient Records Access */}
        {activeTab === 'records' && hasProfile && (
          <PatientRecordsAccess apiUrl={apiUrl} doctorId={doctor.id} />
        )}

        {/* TAB: Consultation Session */}
        {activeTab === 'session' && hasProfile && (
          <DoctorConsultationSession
            apiUrl={apiUrl}
            doctorId={doctor.id}
            onSessionComplete={() => setActiveTab('dashboard')}
          />
        )}

        {/* TAB: Profile Settings */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <ProfileManagement
              apiUrl={apiUrl}
              userId={doctor.userId}
              doctorId={doctor.id}
              onProfileUpdate={handleProfileUpdated}
            />
          </div>
        )}

      </main>
    </div>
  );
}
