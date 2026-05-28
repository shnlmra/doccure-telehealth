'use client';

import React from 'react';
import { usePatient } from '@/modules/patient/components/PatientContext';
import ProfileSettings from '@/modules/patient/components/ProfileSettings';

export default function PatientProfilePage() {
  const { patient } = usePatient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (!patient) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Profile Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Manage your clinical identity, contact details, and medical records history.</p>
      <ProfileSettings apiUrl={apiUrl} patientId={patient.id} />
    </div>
  );
}
