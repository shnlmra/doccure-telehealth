'use client';

import React from 'react';
import { HeartPulse, Video } from 'lucide-react';
import { usePatient } from '@/modules/patient/components/PatientContext';

export default function PatientDashboardPage() {
  const { patient } = usePatient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (!patient) return null;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Welcome Back</h1>
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
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>Quick Reference</h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong>Emergency Contact:</strong><br />
            911 (or local emergency line)
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <strong>Support Desk:</strong><br />
            support@doccure.com
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <strong>Wellness Tip:</strong><br />
            Drink at least 8 glasses of water daily and take 5-minute movement breaks during long desk sessions.
          </div>
        </div>
      </div>
    </div>
  );
}
