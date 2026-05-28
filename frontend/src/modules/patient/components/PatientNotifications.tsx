import React, { useState, useEffect } from 'react';
import { Bell, Check, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface PatientNotificationsProps {
  apiUrl: string;
  userId: string;
}

export default function PatientNotifications({ apiUrl, userId }: PatientNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${apiUrl}/patients/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Could not fetch notifications from API. Fallback mock list.');
      setNotifications([
        {
          id: 'mock-notif-1',
          title: 'Appointment Booked',
          message: 'Your appointment with Dr. Sarah Connor has been scheduled for tomorrow.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mock-notif-2',
          title: 'AI Analysis Ready',
          message: 'Your symptom check is finished. We recommend scheduling an appointment with a Dermatologist.',
          isRead: true,
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [apiUrl, userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${apiUrl}/patients/notifications/${userId}/${id}/read`, {
        method: 'PATCH',
      });
      // Refresh local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.warn('Failed to mark read on server, modifying client-side.');
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--primary)' }} /> Notifications
        </h3>
        <button onClick={fetchNotifications} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
          <RefreshCw size={12} /> Sync
        </button>
      </div>

      {loading ? (
        <div>Syncing notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
          Your inbox is currently clear.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                borderLeft: n.isRead ? '3px solid var(--border)' : '3px solid var(--primary)',
                backgroundColor: n.isRead ? 'var(--card-bg)' : 'var(--primary-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {n.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  title="Mark as read"
                  style={{
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Check size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
