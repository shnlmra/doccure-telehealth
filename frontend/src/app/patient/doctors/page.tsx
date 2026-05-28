'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatient } from '@/modules/patient/components/PatientContext';
import DoctorDiscovery from '@/modules/patient/components/DoctorDiscovery';
import AppointmentBooking from '@/modules/patient/components/AppointmentBooking';

interface SelectedDoc {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  consultationFee?: number;
}

export default function PatientDoctorsPage() {
  const { patient } = usePatient();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const [selectedDocForBooking, setSelectedDocForBooking] = useState<SelectedDoc | null>(null);

  if (!patient) return null;

  return (
    <div>
      {selectedDocForBooking ? (
        <AppointmentBooking
          apiUrl={apiUrl}
          patientId={patient.id}
          doctor={selectedDocForBooking}
          onBack={() => setSelectedDocForBooking(null)}
          onBookingSuccess={() => {
            setSelectedDocForBooking(null);
            router.push('/patient/dashboard');
          }}
        />
      ) : (
        <DoctorDiscovery
          apiUrl={apiUrl}
          onSelectDoctor={(doc) => setSelectedDocForBooking(doc)}
        />
      )}
    </div>
  );
}
