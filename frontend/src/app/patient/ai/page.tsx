'use client';

import React from 'react';
import { usePatient } from '@/modules/patient/components/PatientContext';
import AiRecommendations from '@/modules/patient/components/AiRecommendations';

export default function PatientAiPage() {
  const { patient } = usePatient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (!patient) return null;

  return (
    <AiRecommendations apiUrl={apiUrl} patientId={patient.id} />
  );
}
