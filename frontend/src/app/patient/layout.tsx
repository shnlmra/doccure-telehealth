'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, Video, FileText, Bell, User, LogOut } from 'lucide-react';
import { PatientProvider, usePatient } from '@/modules/patient/components/PatientContext';
import AccountCreation from '@/modules/patient/components/AccountCreation';
import RealTimeNotifications from '@/modules/patient/components/RealTimeNotifications';
import { ToastProvider, useToast } from '@/modules/patient/components/ToastContext';

function PatientLayoutInner({ children }: { children: React.ReactNode }) {
  const { patient, loading, setPatient, signOut } = usePatient();
  const { addToast } = useToast();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const pathname = usePathname();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--background)',
        color: 'var(--text-secondary)',
        fontFamily: 'inherit'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Synchronizing secure session...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Retrieving encryption keys</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    const handleRegisterSuccess = (id: string, email: string, userId: string) => {
      setPatient({ id, email, userId });
    };

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

  const navItems = [
    { href: '/patient/dashboard', label: 'Patient Dashboard', icon: <Home size={18} /> },
    { href: '/patient/doctors', label: 'Find Doctors', icon: <Search size={18} /> },
    { href: '/patient/ai', label: 'AI Diagnosis Recommendation', icon: <Sparkles size={18} /> },
    { href: '/patient/session', label: 'Consultation Sessions', icon: <Video size={18} /> },
    { href: '/patient/records', label: 'Medical History & Records', icon: <FileText size={18} /> },
    { href: '/patient/profile', label: 'Profile Settings', icon: <User size={18} /> },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
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
            {patient.email[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Patient Portal</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.email}</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button
            onClick={() => setShowSignOutConfirm(true)}
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
              fontWeight: '500',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={18} />
            <span style={{ fontSize: '0.9rem' }}>Sign Out Portal</span>
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--card-bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Doccure Patient Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <RealTimeNotifications apiUrl={apiUrl} userId={patient.userId} />
          </div>
        </header>
        <main className="main-content" style={{ padding: '30px 40px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {showSignOutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: '400px',
            width: '100%',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Confirm Sign Out
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to sign out of the secure portal? You will need to verify your credentials to log back in.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  addToast('Signed Out', 'You have been successfully signed out.', 'success');
                  setTimeout(() => {
                    signOut();
                  }, 1200);
                }}
                className="btn btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--danger)',
                  borderColor: 'var(--danger)'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <ToastProvider>
        <PatientLayoutInner>{children}</PatientLayoutInner>
      </ToastProvider>
    </PatientProvider>
  );
}
