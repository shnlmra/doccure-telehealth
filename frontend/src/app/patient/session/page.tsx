'use client';

import React from 'react';
import { usePatient } from '@/modules/patient/components/PatientContext';
import ConsultationSessions from '@/modules/patient/components/ConsultationSessions';

export default function PatientSessionPage() {
  const { patient } = usePatient();

  if (!patient) return null;

  return (
    <ConsultationSessions />
  );
}
