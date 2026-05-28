'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Patient {
  id: string;
  email: string;
  userId: string;
}

interface PatientContextType {
  patient: Patient | null;
  loading: boolean;
  setPatient: (patient: Patient | null) => void;
  signOut: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatientState] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('patient_session');
    if (stored) {
      try {
        setPatientState(JSON.parse(stored));
      } catch (e) {
        console.warn('Could not parse patient session from storage', e);
      }
    }
    setLoading(false);
  }, []);

  const setPatient = (newPatient: Patient | null) => {
    setPatientState(newPatient);
    if (newPatient) {
      sessionStorage.setItem('patient_session', JSON.stringify(newPatient));
    } else {
      sessionStorage.removeItem('patient_session');
    }
  };

  const signOut = () => {
    setPatient(null);
  };

  return (
    <PatientContext.Provider value={{ patient, loading, setPatient, signOut }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
