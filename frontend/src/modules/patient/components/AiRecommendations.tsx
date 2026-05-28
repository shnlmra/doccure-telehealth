import React, { useState, useEffect } from 'react';
import { Sparkles, History, Send, ShieldAlert, ArrowRight } from 'lucide-react';

interface Recommendation {
  id: string;
  symptoms: string;
  suggestedSpecialization: string;
  advice: string;
  createdAt: string;
}

interface AiRecommendationsProps {
  apiUrl: string;
  patientId: string;
}

export default function AiRecommendations({ apiUrl, patientId }: AiRecommendationsProps) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<Recommendation | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/patients/${patientId}/ai-recommendations`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.warn('Could not load AI recommendations from API. Fallback mock list.');
      setHistory([
        {
          id: 'mock-rec-1',
          symptoms: 'I have had a mild dry cough and slight chest congestion for three days, no fever.',
          suggestedSpecialization: 'General Physician',
          advice: 'Your symptoms appear mild. Keep hydrated and get plenty of rest. If conditions persist or a high fever develops, please schedule an appointment.',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'mock-rec-2',
          symptoms: 'Sudden sharp pain in chest when breathing heavily, feeling slightly dizzy.',
          suggestedSpecialization: 'Cardiologist',
          advice: 'WARNING: Symptoms could relate to cardiovascular issues. Please consult a Cardiologist immediately. If experiencing severe shortness of breath or radiating chest pain, seek emergency services.',
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    if (patientId) fetchHistory();
  }, [apiUrl, patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setCurrentRecommendation(null);

    try {
      const res = await fetch(`${apiUrl}/patients/${patientId}/ai-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI request failed');

      setCurrentRecommendation(data);
      setSymptoms('');
      fetchHistory();
    } catch (err: any) {
      // Mock Fallback
      console.warn('API error, executing mock AI analyzer.', err);
      setTimeout(() => {
        const lower = symptoms.toLowerCase();
        let suggested = 'General Physician';
        let adviceText = 'Please keep warm and hydrate. If your symptoms worsen, schedule an appointment.';

        if (lower.includes('chest') || lower.includes('heart') || lower.includes('breath')) {
          suggested = 'Cardiologist';
          adviceText = 'WARNING: Symptoms could relate to cardiovascular issues. Please consult a Cardiologist immediately. If experiencing severe shortness of breath or radiating chest pain, seek emergency services.';
        } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('itch')) {
          suggested = 'Dermatologist';
          adviceText = 'Skin rashes can be triggered by allergens or infections. Keep the area clean, avoid scratching, and book a consultation with a Dermatologist.';
        }

        const mockRec: Recommendation = {
          id: `mock-rec-${Date.now()}`,
          symptoms,
          suggestedSpecialization: suggested,
          advice: adviceText,
          createdAt: new Date().toISOString(),
        };

        setCurrentRecommendation(mockRec);
        setHistory((prev) => [mockRec, ...prev]);
        setSymptoms('');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }} className="animate-fade-in">
      
      {/* Symptom Checker Form */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <span className="badge badge-ai" style={{ marginBottom: '8px' }}>
            <Sparkles size={12} /> AI Powered
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>AI Symptom Recommendation</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Describe what you feel, and our clinical engine will direct you to the correct specialist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">How are you feeling today?</label>
            <textarea
              className="form-input"
              rows={4}
              required
              placeholder="Describe symptoms in detail (e.g. 'I have a sharp pain in my upper stomach after meals, along with nausea...')"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-ai" style={{ width: '100%' }}>
            {loading ? 'Analyzing Symptoms...' : (
              <>
                <Send size={16} /> Run Diagnostics
              </>
            )}
          </button>
        </form>

        {/* Diagnostic Result */}
        {currentRecommendation && (
          <div className="card animate-fade-in" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(2, 132, 199, 0.05) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--ai-accent)' }}>
              <Sparkles size={20} />
              <h3 style={{ fontWeight: '800' }}>Analysis Report</h3>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RECOMMENDED DEPT</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                {currentRecommendation.suggestedSpecialization} <ArrowRight size={18} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: currentRecommendation.advice.includes('WARNING') ? 'var(--danger-light)' : 'var(--primary-light)',
              color: currentRecommendation.advice.includes('WARNING') ? 'var(--danger)' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Recommendation Advice</strong>
                {currentRecommendation.advice}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Query History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <History size={20} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Past Inquiries</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No past recommendations.</div>
          ) : (
            history.map((rec) => (
              <div key={rec.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-success">{rec.suggestedSpecialization}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  &ldquo;{rec.symptoms}&rdquo;
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--border)', paddingLeft: '10px' }}>
                  {rec.advice}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
