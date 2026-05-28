import React, { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/modules/patient/components/ToastContext';

interface AccountCreationProps {
  apiUrl: string;
  onSuccess: (patientId: string, email: string, userId: string) => void;
}

export default function AccountCreation({ apiUrl, onSuccess }: AccountCreationProps) {
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: 'Male',
    dateOfBirth: '1995-01-01',
    weight: '70',
    height: '170',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          const apiError = new Error(data.message || 'Login failed.');
          (apiError as any).isApiError = true;
          throw apiError;
        }

        addToast('Welcome Back', 'Logged in successfully!', 'success');
        setMessage({ type: 'success', text: 'Logged in successfully!' });
        setTimeout(() => {
          onSuccess(data.user.profileId || 'mock-profile-id', data.user.email, data.user.id);
        }, 1000);
      } else {
        // --- REGISTER FLOW ---
        // Step 1: Register User
        const resRegister = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, role: 'patient' }),
        });
        const regData = await resRegister.json();
        if (!resRegister.ok) {
          const apiError = new Error(regData.message || 'Registration failed.');
          (apiError as any).isApiError = true;
          throw apiError;
        }

        // Step 2: Update Profile details
        const resProfile = await fetch(`${apiUrl}/patients/${regData.userId}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            birthday: formData.dateOfBirth,
            weight: parseFloat(formData.weight) || 70,
            height: parseFloat(formData.height) || 170,
            contactNumber: formData.phoneNumber,
            medicalHistory: 'None declared.',
          }),
        });
        const profData = await resProfile.json();
        if (!resProfile.ok) {
          const apiError = new Error(profData.message || 'Profile creation failed.');
          (apiError as any).isApiError = true;
          throw apiError;
        }

        addToast('Registration Success', 'Account registered and profile completed!', 'success');
        setMessage({ type: 'success', text: 'Account registered and profile completed!' });
        setTimeout(() => {
          onSuccess(profData.id, regData.email, regData.userId);
        }, 1000);
      }
    } catch (err: any) {
      console.warn('API error during auth/register.', err);
      
      if (err.isApiError) {
        addToast('Authentication Alert', err.message, 'error');
        setMessage({ type: 'error', text: err.message });
      } else {
        addToast('Authentication Alert', 'Could not connect. Fallback to mock session.', 'warning');
        setMessage({ type: 'error', text: 'Could not connect. Fallback to mock session.' });
        setTimeout(() => {
          onSuccess('mock-patient-profile-123', formData.email || 'john.doe@example.com', 'mock-user-id-789');
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <UserPlus size={24} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
          {isLogin ? 'Patient Login' : 'Patient Registration'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {isLogin ? 'Log into your secure portal' : 'Create your secure Doccure account'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            required
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            placeholder="Min. 6 characters"
            className="form-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        {!isLogin && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.85rem',
            backgroundColor: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)'
          }}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
