'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Sparkles, Video, FileText, Bell, User, LogOut, HeartPulse } from 'lucide-react';
import AccountCreation from '@/modules/patient/components/AccountCreation';
import ProfileSettings from '@/modules/patient/components/ProfileSettings';
import DoctorDiscovery from '@/modules/patient/components/DoctorDiscovery';
import AiRecommendations from '@/modules/patient/components/AiRecommendations';
import AppointmentBooking from '@/modules/patient/components/AppointmentBooking';
import PatientNotifications from '@/modules/patient/components/PatientNotifications';
import ConsultationSessions from '@/modules/patient/components/ConsultationSessions';
import MedicalRecords from '@/modules/patient/components/MedicalRecords';

type ActiveTab = 'dashboard' | 'doctors' | 'ai' | 'session' | 'records' | 'notifications' | 'profile';

interface SelectedDoc {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  consultationFee?: number;
}

export default function PatientDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  // Auth State
  const [patient, setPatient] = useState<{ id: string; email: string; userId: string } | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Booking Flow State
  const [selectedDocForBooking, setSelectedDocForBooking] = useState<SelectedDoc | null>(null);

  const handleRegisterSuccess = (id: string, email: string, userId: string) => {
    setPatient({ id, email, userId });
  };

  const handleSignOut = () => {
    setPatient(null);
    setActiveTab('dashboard');
    setSelectedDocForBooking(null);
  };

  if (!patient) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 70%), var(--background)'
      }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
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
            Enter virtual details or register to log in.
          </div>
        </div>
        <AccountCreation apiUrl={apiUrl} onSuccess={handleRegisterSuccess} />
      </div>
    );
  }

  // Sidebar navigation options
  const navItems = [
    { id: 'dashboard', label: 'Patient Dashboard', icon: <Home size={18} /> },
    { id: 'doctors', label: 'Find Doctors', icon: <Search size={18} /> },
    { id: 'ai', label: 'AI Diagnosis Recommendation', icon: <Sparkles size={18} /> },
    { id: 'session', label: 'Consultation Sessions', icon: <Video size={18} /> },
    { id: 'records', label: 'Medical History & Records', icon: <FileText size={18} /> },
    { id: 'notifications', label: 'Notifications Inbox', icon: <Bell size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            D
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>Doccure Patient</span>
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
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            JD
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>John Doe</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.email}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setSelectedDocForBooking(null); // Reset booking screen if tab switches
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
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
        
        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Welcome Back, John</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Here is a summary of your recent wellness records and schedules.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <HeartPulse size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Diagnosis Suggestions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Recommendation</div>
                </div>
              </div>
              
              <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                  <Video size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upcoming Sessions</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>1 Secure Video Call</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Your Treatment Timeline</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select the <strong>Medical History & Records</strong> tab to review previous consultations, active doctor prescription orders, or diagnosis timelines.</p>
              </div>
              
              <PatientNotifications apiUrl={apiUrl} userId={patient.userId} />
            </div>
          </div>
        )}

        {/* TAB: Find Doctors & Booking */}
        {activeTab === 'doctors' && (
          <div>
            {selectedDocForBooking ? (
              <AppointmentBooking
                apiUrl={apiUrl}
                patientId={patient.id}
                doctor={selectedDocForBooking}
                onBack={() => setSelectedDocForBooking(null)}
                onBookingSuccess={() => {
                  setSelectedDocForBooking(null);
                  setActiveTab('dashboard');
                }}
              />
            ) : (
              <DoctorDiscovery
                apiUrl={apiUrl}
                onSelectDoctor={(doc) => setSelectedDocForBooking(doc)}
              />
            )}
          </div>
        )}

        {/* TAB: AI Recommendation */}
        {activeTab === 'ai' && (
          <AiRecommendations apiUrl={apiUrl} patientId={patient.id} />
        )}

        {/* TAB: Active Session */}
        {activeTab === 'session' && (
          <ConsultationSessions />
        )}

        {/* TAB: Medical Records */}
        {activeTab === 'records' && (
          <MedicalRecords apiUrl={apiUrl} patientId={patient.id} />
        )}

        {/* TAB: Notifications */}
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <PatientNotifications apiUrl={apiUrl} userId={patient.userId} />
          </div>
        )}

        {/* TAB: Profile */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <ProfileSettings apiUrl={apiUrl} patientId={patient.id} />
          </div>
        )}

      </main>
    </div>
  );
}
