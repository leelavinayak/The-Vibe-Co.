import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiUser, HiBell, HiClipboardList, HiPencil, HiLogout } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotificationsTab from './NotificationsPage';
import HistoryTab from './InquiryHistoryPage';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', state: '', city: '', serviceName: '', serviceType: '', description: '', priceStartsFrom: '', instagram: '', images: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { key: 'profile', label: 'Profile', icon: <HiUser /> },
    { key: 'notifications', label: 'Notifications', icon: <HiBell /> },
    { key: 'history', label: 'History', icon: <HiClipboardList /> },
  ];

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/auth/profile');
      if (data?.user) {
        setProfileData(data);
        setEditForm({
          name: data.user.name || '', phone: data.user.phone || '', email: data.user.email || '',
          state: data.user.state || '', city: data.user.city || '',
          serviceName: data.user.serviceId?.name || '', serviceType: data.user.serviceId?.type || '',
          description: data.user.serviceId?.description || '', priceStartsFrom: data.user.serviceId?.priceStartsFrom || '',
          instagram: data.user.serviceId?.instagram || '', images: data.user.serviceId?.images?.join(', ') || ''
        });
      }
    } catch (error) { console.error('Error fetching profile:', error); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    const payload = { ...editForm, images: editForm.images ? editForm.images.split(',').map(u => u.trim()).filter(u => u) : [] };
    const result = await updateProfile(payload);
    if (result.success) { setIsEditing(false); fetchProfile(); }
    setUpdateLoading(false);
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setIsUploading(true);
      const uploads = files.map(file => { const fd = new FormData(); fd.append('image', file); return axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } }); });
      const responses = await Promise.all(uploads);
      const newUrls = responses.map(r => r.data.url);
      const current = editForm.images ? editForm.images.split(',').map(u => u.trim()).filter(u => u) : [];
      setEditForm(prev => ({ ...prev, images: [...current, ...newUrls].join(', ') }));
    } catch (err) { console.error('Upload error:', err); }
    finally { setIsUploading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading Profile..." />;

  const tabStyle = (key) => ({
    padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif", fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px',
    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease',
    background: activeTab === key ? 'rgba(201,168,76,0.15)' : 'transparent',
    color: activeTab === key ? '#C9A84C' : '#7a7a99',
    borderBottom: activeTab === key ? '2px solid #C9A84C' : '2px solid transparent',
    whiteSpace: 'nowrap',
  });

  return (
    <div className="profile-page-wrapper" style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '120px 20px 80px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div className="header-text">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0 }}>My <span style={{ color: '#C9A84C' }}>Account</span></h1>
            <p style={{ color: '#555', margin: '8px 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 800 }}>Manage your profile, notifications & history</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'profile' && (
              <button onClick={() => setIsEditing(!isEditing)} style={{ background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(201,168,76,0.1)', border: `1px solid ${isEditing ? 'rgba(255,255,255,0.1)' : '#C9A84C'}`, color: isEditing ? '#fff' : '#C9A84C', padding: '10px 22px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
            <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', padding: '10px 22px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="profile-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', paddingBottom: '0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setSearchParams(t.key === 'profile' ? {} : { tab: t.key }); setIsEditing(false); }} style={tabStyle(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isEditing ? (
                <div className="profile-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div className="form-group"><label>Full Name</label><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                    <div className="form-group"><label>Email</label><input className="form-input" value={editForm.email} disabled style={{ opacity: 0.5 }} /></div>
                    <div className="form-group"><label>Phone</label><input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                    <div className="form-group"><label>State</label><input className="form-input" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} /></div>
                    <div className="form-group"><label>City</label><input className="form-input" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} /></div>
                    {profileData?.user.role === 'provider' && (
                      <div style={{ gridColumn: '1 / -1', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
                        <h3 style={{ color: '#C9A84C', marginBottom: '30px' }}>Service Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="service-form-grid">
                          <div className="form-group"><label>Business Name</label><input className="form-input" value={editForm.serviceName} onChange={e => setEditForm({...editForm, serviceName: e.target.value})} /></div>
                          <div className="form-group"><label>Service Type</label>
                            <select className="form-input" value={editForm.serviceType} onChange={e => setEditForm({...editForm, serviceType: e.target.value})}>
                              <option value="photography">Photography</option><option value="videography">Videography</option>
                              <option value="catering">Catering</option><option value="decoration">Decoration</option>
                              <option value="music">Music / DJ</option><option value="security">Security</option>
                              <option value="total_event_organisation">Total Event Organisation</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>About</label><textarea className="form-input" style={{ minHeight: '120px' }} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Demo Images</label>
                            <div style={{ background: 'rgba(0,0,0,0.2)', border: '2px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
                              <input type="file" multiple hidden id="up-img" onChange={handlePortfolioUpload} accept="image/*" />
                              <label htmlFor="up-img" style={{ cursor: 'pointer', color: '#C9A84C', fontWeight: 700 }}>{isUploading ? 'Uploading...' : 'Add Demo Images'}</label>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                              {editForm.images && editForm.images.split(',').map((url, i) => (
                                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden' }}>
                                  <img src={url.trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                  <button type="button" onClick={() => { const u = editForm.images.split(',').filter((_, idx) => idx !== i).join(', '); setEditForm({...editForm, images: u}); }} style={{ position: 'absolute', top: '2px', right: '2px', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ gridColumn: '1 / -1', marginTop: '30px' }}>
                      <button type="submit" disabled={updateLoading} style={{ width: '100%', background: '#C9A84C', color: '#000', border: 'none', padding: '18px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer' }}>
                        {updateLoading ? 'Saving...' : 'Save All Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div className="profile-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ color: '#C9A84C', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><HiUser /> User Details</h3>
                    <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                      <InfoItem label="Full Name" value={profileData?.user.name} />
                      <InfoItem label="Email" value={profileData?.user.email} />
                      <InfoItem label="Phone" value={profileData?.user.phone || 'Not provided'} />
                      <InfoItem label="Location" value={`${profileData?.user.city ? profileData.user.city + ', ' : ''}${profileData?.user.state || 'Global'}`} />
                      <InfoItem label="Account Type" value={profileData?.user.role.toUpperCase()} />
                    </div>
                  </div>
                  {profileData?.user.role === 'provider' && (
                    <div className="profile-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ color: '#C9A84C', marginBottom: '30px' }}>Service Details</h3>
                      <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                        <InfoItem label="Business Name" value={profileData?.user.serviceId?.name || profileData?.user.name} />
                        <InfoItem label="Category" value={profileData?.user.serviceId?.type?.replace('_', ' ').toUpperCase()} />
                        <InfoItem label="Starting From" value={profileData?.user.serviceId?.priceStartsFrom || 'On Request'} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'notifications' && (
            <motion.div key="notifs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <NotificationsTab embedded />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <HistoryTab embedded />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        .form-input { width: 100%; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 1rem; }
        .form-group label { display: block; color: #555; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; font-weight: 800; }
        .profile-tabs::-webkit-scrollbar { display: none; }
        
        @media (max-width: 768px) { 
          .profile-page-wrapper { padding: 100px 15px 40px !important; }
          .profile-header { flex-direction: column; align-items: flex-start !important; gap: 20px; }
          .profile-header h1 { font-size: 2rem !important; }
          .profile-card { padding: 25px !important; border-radius: 24px !important; }
          .details-grid { gap: 25px !important; }
          .service-form-grid { grid-template-columns: 1fr !important; }
          form { grid-template-columns: 1fr !important; gap: 20px !important; }
          .profile-tabs { margin-bottom: 30px !important; }
        }
      `}</style>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: 800 }}>{label}</span>
    <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.6 }}>{value}</span>
  </div>
);

export default ProfilePage;
