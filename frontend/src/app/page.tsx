'use client';

import React from 'react';
import Link from 'next/link';
import { User, Activity, Shield, Calendar, Sparkles, ClipboardList } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.05) 0%, rgba(255, 255, 255, 0) 80%), var(--background)'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--card-bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            Doccure<span style={{ color: 'var(--primary)', fontWeight: '500' }}>.telehealth</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span className="badge badge-success" style={{ textTransform: 'none', padding: '6px 12px' }}>
            <Shield size={14} /> HIPAA Secure
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fade-in">
          <span className="badge badge-primary" style={{ marginBottom: '16px', textTransform: 'none', fontSize: '0.85rem' }}>
            <Activity size={14} /> Next-Generation Virtual Healthcare
          </span>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>
            Your Health, <span style={{ background: 'linear-gradient(to right, var(--primary), var(--ai-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Synchronized</span>
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Access instant AI recommendations, schedule real-time video consults, manage clinical notes, and track your history in a fully integrated, Dockerized environment.
          </p>
        </div>

        {/* Portal Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          width: '100%',
          marginBottom: '50px'
        }}>
          {/* Patient Card */}
          <div className="card scale-hover" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '5px solid var(--primary)',
            padding: '35px'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '25px'
              }}>
                <User size={30} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '12px' }}>Patient Portal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Create accounts, receive AI-driven doctor suggestions, book clinical consultations, check prescriptions, and view your digital medical history.
              </p>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '35px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--ai-accent)' }} /> AI Symptom recommendation engine
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} /> Real-time Doctor booking calendar
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} style={{ color: 'var(--success)' }} /> Patient medical record timelines
                </li>
              </ul>
            </div>
            <Link href="/patient" className="btn btn-primary" style={{ width: '100%' }}>
              Enter Patient Portal
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="card scale-hover" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '5px solid var(--ai-accent)',
            padding: '35px'
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--ai-accent-light)',
                color: 'var(--ai-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '25px'
              }}>
                <Activity size={30} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '12px' }}>Doctor Portal</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Manage weekly clinical availability, write electronic consultation notes, prescribe medication list, and retrieve comprehensive medical history records.
              </p>
              <ul style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '35px',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: 'var(--ai-accent)' }} /> Custom timeslot scheduling pad
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} style={{ color: 'var(--success)' }} /> Direct digital prescription builder
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} /> Patient clinical records repository
                </li>
              </ul>
            </div>
            <Link href="/doctor" className="btn btn-secondary" style={{
              width: '100%',
              borderColor: 'var(--ai-accent)',
              color: 'var(--ai-accent)'
            }}>
              Enter Doctor Portal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--card-bg)',
      }}>
        © 2026 Doccure Telehealth Platform. All rights reserved. Fully Dockerized and Deployment-ready.
      </footer>
    </div>
  );
}
