'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Calendar, ShieldCheck, HeartPulse } from 'lucide-react';
import { io } from 'socket.io-client';
import { useToast } from '@/modules/patient/components/ToastContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface RealTimeNotificationsProps {
  apiUrl: string;
  userId: string;
}

export default function RealTimeNotifications({ apiUrl, userId }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!userId || userId.startsWith('mock-')) return;
    try {
      const res = await fetch(`${apiUrl}/patients/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Could not fetch notifications from API.', e);
    }
  };

  useEffect(() => {
    if (userId && !userId.startsWith('mock-')) {
      fetchNotifications();
    }
  }, [apiUrl, userId]);

  // Recalculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Socket connection
  useEffect(() => {
    if (!userId || userId.startsWith('mock-')) return;

    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl, {
      query: { userId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[RealTimeNotifications] Connected to WebSocket server');
    });

    socket.on('notification', (newNotif: Notification) => {
      console.log('[RealTimeNotifications] Received notification:', newNotif);
      setNotifications((prev) => [newNotif, ...prev]);

      // Determine variant based on title/message
      let variant: 'success' | 'error' | 'warning' | 'info' = 'info';
      const t = newNotif.title.toLowerCase();
      if (t.includes('confirm') || t.includes('booked')) variant = 'success';
      else if (t.includes('cancel')) variant = 'error';
      else if (t.includes('reschedule')) variant = 'warning';
      else if (t.includes('active') || t.includes('reminder')) variant = 'info';

      // Trigger global toast
      addToast(newNotif.title, newNotif.message, variant);
    });

    socket.on('disconnect', () => {
      console.log('[RealTimeNotifications] Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, userId, addToast]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    if (!userId || userId.startsWith('mock-')) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/patients/notifications/${userId}/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      console.warn('Failed to mark read on server, updating local state.', e);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    if (!userId || userId.startsWith('mock-')) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      return;
    }

    try {
      // Mark all read on backend concurrently
      await Promise.all(
        unreadNotifications.map(n =>
          fetch(`${apiUrl}/patients/notifications/${userId}/${n.id}/read`, {
            method: 'PATCH',
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.warn('Failed to mark all read on server, updating local state.', e);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const getIconForNotification = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('book') || t.includes('confirm')) return <Calendar size={16} style={{ color: 'var(--success)' }} />;
    if (t.includes('cancel')) return <Calendar size={16} style={{ color: 'var(--danger)' }} />; // fallback calendar or check icon
    if (t.includes('session') || t.includes('active') || t.includes('reminder')) return <HeartPulse size={16} style={{ color: 'var(--primary)' }} />;
    if (t.includes('record') || t.includes('prescription') || t.includes('log')) return <ShieldCheck size={16} style={{ color: 'var(--ai-accent)' }} />;
    return <Bell size={16} style={{ color: 'var(--text-secondary)' }} />;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* CSS Styles injection for animations */}
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.95) translateY(-5px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .dropdown-panel {
          animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-shadow: var(--shadow-lg);
        }
        .notif-item {
          transition: background-color 0.2s ease;
        }
        .notif-item:hover {
          background-color: var(--background) !important;
        }
      `}</style>

      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'background-color 0.2s',
          backgroundColor: isOpen ? 'var(--primary-light)' : 'transparent',
          color: isOpen ? 'var(--primary)' : 'var(--text-secondary)'
        }}
        className="scale-hover"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: 'var(--danger)',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--card-bg)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          className="dropdown-panel"
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '360px',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '480px'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--background)'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Bell size={28} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                Your notification log is clear.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="notif-item"
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(2, 132, 199, 0.03)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: n.isRead ? 'var(--background)' : 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px'
                  }}>
                    {getIconForNotification(n.title)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: n.isRead ? '600' : '700',
                        color: 'var(--text-primary)',
                        paddingRight: '12px'
                      }}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px'
                          }}
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      lineHeight: '1.4'
                    }}>
                      {n.message}
                    </p>
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginTop: '6px'
                    }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
