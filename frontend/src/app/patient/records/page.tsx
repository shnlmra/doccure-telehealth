'use client';

import React from 'react';
import { usePatient } from '@/modules/patient/components/PatientContext';
import MedicalRecords from '@/modules/patient/components/MedicalRecords';

export default function PatientRecordsPage() {
  const { patient } = usePatient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  if (!patient) return null;

  return (
    <MedicalRecords apiUrl={apiUrl} patientId={patient.id} />
  );
}
