'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatient } from '@/modules/patient/components/PatientContext';

export default function PatientRootPage() {
  const { patient, loading } = usePatient();
  const router = useRouter();

  useEffect(() => {
    if (!loading && patient) {
      router.push('/patient/dashboard');
    }
  }, [patient, loading, router]);

  return (
    <div style={{ display: 'flex', minHeight: '60vh', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ textAlign: 'center' }}>
        <h3>Redirecting to secure terminal...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preparing workspace session</p>
      </div>
    </div>
  );
}
