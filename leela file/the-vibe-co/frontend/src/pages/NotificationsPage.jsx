import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiX, HiClock, HiArrowLeft } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = ({ embedded = false }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await axios.delete('/api/notifications');
        setNotifications([]);
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: embedded ? '200px' : '100vh', background: embedded ? 'transparent' : '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '3px solid rgba(201,168,76,0.1)', borderTopColor: '#C9A84C', borderRadius: '50%' }} />
      </div>
    );
  }

  const content = (
    <>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            {!embedded && (
              <button 
                onClick={() => navigate(-1)} 
                style={{ background: 'none', border: 'none', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '15px', padding: 0 }}
              >
                <HiArrowLeft /> Back
              </button>
            )}
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: embedded ? '1.8rem' : '2.5rem', margin: 0 }}>Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll} 
              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Clear All
            </button>
          )}
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={notif._id}
                onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                style={{
                  background: notif.read ? 'rgba(255,255,255,0.02)' : 'linear-gradient(90deg, rgba(201, 168, 76, 0.08), transparent)',
                  padding: '24px',
                  borderRadius: '20px',
                  border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(201, 168, 76, 0.2)'}`,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>{notif.title}</span>
                      {!notif.read && <span style={{ width: '8px', height: '8px', background: '#C9A84C', borderRadius: '50%' }}></span>}
                    </div>
                    <p style={{ color: '#7a7a99', fontSize: '0.95rem', margin: '0 0 12px 0', lineHeight: 1.5 }}>{notif.message}</p>
                    <div style={{ color: notif.read ? '#555577' : '#C9A84C', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HiClock /> {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                    style={{ background: 'rgba(255,68,68,0.05)', border: 'none', color: '#ff4444', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <HiX />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)' }}>
              <HiBell style={{ fontSize: '50px', color: '#222', marginBottom: '20px' }} />
              <h4 style={{ fontSize: '1.3rem', color: '#555', margin: 0 }}>No notifications yet</h4>
              <p style={{ color: '#333', marginTop: '10px' }}>We'll alert you here about your event status.</p>
            </div>
          )}
        </div>

    </>
  );

  if (embedded) return content;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '120px 20px 60px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {content}
      </div>
    </div>
  );
};

export default NotificationsPage;
