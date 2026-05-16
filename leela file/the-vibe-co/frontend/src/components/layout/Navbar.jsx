import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX, HiUserCircle, HiBell, HiClipboardList } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (user?.role === 'admin' || location.pathname === '/admin') return null;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/services', label: 'Services' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  let desktopLinks = [...navLinks];
  let mobileLinks = [...navLinks];

  if (user) {
    if (user.role === 'admin') {
      desktopLinks = [...navLinks, { path: '/admin', label: 'Dashboard' }];
      mobileLinks = [...navLinks, { path: '/admin', label: 'Dashboard' }, { path: '/profile', label: 'Profile' }];
    } else if (user.role === 'provider') {
      desktopLinks = [{ path: '/dashboard', label: 'Dashboard' }];
      mobileLinks = [{ path: '/dashboard', label: 'Dashboard' }, { path: '/profile', label: 'Profile' }];
    } else {
      mobileLinks.push({ path: '/profile', label: 'My Profile' });
      mobileLinks.push({ path: '/profile?tab=notifications', label: 'Notifications' });
      mobileLinks.push({ path: '/profile?tab=history', label: 'History' });
    }
  } else {
    mobileLinks.push({ path: '/login', label: 'Login' });
  }

  const linkStyle = (path) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: location.pathname === path ? '#C9A84C' : '#b3b3cc',
    position: 'relative',
    transition: 'color 0.3s ease',
  });

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          padding: isScrolled ? '12px 0' : '20px 0',
          background: isScrolled ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(201, 168, 76, 0.1)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="navbar-logo-img" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1px solid rgba(201, 168, 76, 0.2)'
              }}>
                <img src="/TheVibeCo._logo.png" alt="The Vibe Co Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="navbar-logo-text">
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.2rem', fontWeight: 900, color: '#fff',
                  letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  THE VIBE CO.
                </div>
                <div className="navbar-tagline" style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.5rem', letterSpacing: '3px',
                  textTransform: 'uppercase', color: '#7a7a99', marginTop: '-1px',
                }}>
                  Premium Events
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Nav - All Links Together */}
          <div className="desktop-nav" style={{
            display: 'flex', alignItems: 'center', gap: '28px',
          }}>
            {desktopLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={linkStyle(link.path)}
                onMouseEnter={(e) => e.target.style.color = '#C9A84C'}
                onMouseLeave={(e) => {
                  if (location.pathname !== link.path) e.target.style.color = '#b3b3cc';
                }}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div layoutId="nav-indicator" style={{
                    position: 'absolute', bottom: '-8px', left: 0, right: 0,
                    height: '2px', background: 'linear-gradient(90deg, #C9A84C, #FFD700)', borderRadius: '2px',
                  }} />
                )}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/profile" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: location.pathname === '/profile' ? '#C9A84C' : '#b3b3cc',
                  textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 500,
                  letterSpacing: '2px', fontFamily: "'Outfit', sans-serif",
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: user?.avatar ? `url(${user.avatar}) center/cover` : 'rgba(201, 168, 76, 0.15)',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: '#C9A84C'
                  }}>
                    {!user?.avatar && user?.name && (
                      <span>{user.name.charAt(0).toUpperCase()}{user.name.slice(-1).toUpperCase()}</span>
                    )}
                  </div> Profile
                </Link>
                {user.role !== 'admin' && (
                  <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.8rem' }}>
                    Book Now
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" style={linkStyle('/login')}>Login</Link>
                <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.8rem' }}>
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user && (
              <Link to="/profile?tab=notifications" className="mobile-notif-btn" style={{
                display: 'none', position: 'relative',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '1.2rem',
              }}>
                <HiBell />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '8px', height: '8px', background: '#ff4444',
                    borderRadius: '50%', border: '1px solid #0a0a0a'
                  }}></span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '50%', width: '45px', height: '45px',
                alignItems: 'center', justifyContent: 'center',
                color: '#C9A84C', fontSize: '1.5rem', cursor: 'pointer',
                transition: 'all 0.3s ease', zIndex: 1001,
              }}
            >
              {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', top: 0, right: 0,
              width: '100%', height: '100vh',
              background: 'radial-gradient(circle at center, rgba(30,25,10,0.98) 0%, rgba(10,10,10,0.98) 100%)',
              backdropFilter: 'blur(25px)', zIndex: 999,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '24px',
              padding: '60px 20px',
            }}
          >
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', textAlign: 'center' }}
              >
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '50%', 
                  background: user?.avatar ? `url(${user.avatar}) center/cover` : 'rgba(201, 168, 76, 0.15)', 
                  border: '2px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '1.8rem', fontWeight: 800, color: '#C9A84C', marginBottom: '12px',
                  boxShadow: '0 0 20px rgba(201, 168, 76, 0.2)'
                }}>
                  {!user?.avatar && user?.name && user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 600, fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>{user.name}</div>
                <div style={{ color: '#C9A84C', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px', opacity: 0.8 }}>{user.role} Account</div>
              </motion.div>
            )}

            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', 
              maxHeight: '60vh', overflowY: 'auto', width: '100%',
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
              {mobileLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.5rem', fontWeight: 600,
                      color: location.pathname + location.search === link.path ? '#C9A84C' : '#fff',
                      letterSpacing: '2px',
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ marginTop: '10px', padding: '12px 40px' }}>
                Book Now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-notif-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .navbar-tagline { display: none !important; }
          .navbar-logo-text div { font-size: 1rem !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
