'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWindowSize, getScreenCategory } from '@/hooks/useWindowSize';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

export default function ResponsiveHeader() {
  const { width } = useWindowSize();
  const screenCategory = getScreenCategory(width);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  // Close mobile menu when screen becomes desktop size
  useEffect(() => {
    if (screenCategory !== 'mobile' && screenCategory !== 'tablet') {
      setIsMenuOpen(false);
    }
  }, [screenCategory]);

  // Determine if hamburger should be shown based on screen size
  const shouldShowHamburger = width < 1024; // Show hamburger below laptop breakpoint
  const shouldShowFullNav = width >= 1024;   // Show full nav at laptop breakpoint

  return (
    <header 
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg"
      style={{
        width: '100vw',
        height: screenCategory === 'mobile' ? '12vh' : '15vh',
        minHeight: '70px',
        marginTop: 0,
        top: 0,
        left: 0,
        right: 0,
        backgroundImage: 'url(/images/about-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div 
        className="flex items-center justify-between h-full"
        style={{ 
          padding: width < 640 ? '0 0.75rem' : width < 1024 ? '0 1rem' : '0 2rem',
        }}
      >
        {/* Logo Section - Pull Far Left, Very Close Text */}
        <div 
          className="flex items-center flex-shrink-0"
          style={{ 
            gap: '0px',
            minWidth: 'fit-content',
            paddingLeft: '0px',
            marginLeft: '-40px'
          }}
        >
          <div 
            className="relative flex-shrink-0"
            style={{ 
              height: screenCategory === 'mobile' ? '90px' : '150px', 
              width: screenCategory === 'mobile' ? '130px' : '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginRight: '-50px'
            }}
          >
            <img
              src="/images/mymental_logo.png"
              alt="MYMENTAL Logo"
              style={{ 
                height: '100%', 
                width: 'auto',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                margin: 0,
                padding: 0
              }}
            />
          </div>
          <h3 
            className="font-bold gradient-text flex-shrink-0"
            style={{ 
              fontSize: screenCategory === 'mobile' ? '1rem' : '1.8rem',
              whiteSpace: 'nowrap',
              fontWeight: 700,
              background: 'linear-gradient(to right, #b121f3, #44eee0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '1px',
              margin: '0 !important',
              padding: '0 !important',
              lineHeight: '1 !important',
              marginLeft: '-50px !important',
              position: 'relative',
              left: '0px'
            }}
          >
            MYMENTAL
          </h3>
        </div>

        {/* Desktop Navigation - Shows only on laptop+ with Enhanced Hover Effects */}
        {shouldShowFullNav && (
          <nav 
            role="navigation"
            aria-label="Primary"
            className="flex items-center"
            style={{ 
              gap: width >= 1280 ? '2.5rem' : '1.75rem',
              flex: 1,
              justifyContent: 'center',
              maxWidth: '700px',
              padding: '0 1rem'
            }}
          >
            <Link 
              href="/" 
              className="nav-link"
              style={{ 
                fontSize: width >= 1280 ? '1rem' : '0.95rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: pathname === '/' ? 700 : 600,
                color: pathname === '/' ? '#0f172a' : '#334155',
                transition: 'color .15s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { if (pathname !== '/') { e.currentTarget.style.color = '#334155'; } }}
            >
              HOME
            </Link>
            <Link 
              href="/about" 
              className="nav-link"
              style={{ 
                fontSize: width >= 1280 ? '1rem' : '0.95rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: pathname.startsWith('/about') ? 700 : 600,
                color: pathname.startsWith('/about') ? '#0f172a' : '#334155',
                transition: 'color .15s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { if (!pathname.startsWith('/about')) { e.currentTarget.style.color = '#334155'; } }}
            >
              ABOUT
            </Link>
            <Link 
              href="/services/depression" 
              className="nav-link"
              style={{ 
                fontSize: width >= 1280 ? '1rem' : '0.95rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: pathname.startsWith('/services') ? 700 : 600,
                color: pathname.startsWith('/services') ? '#0f172a' : '#334155',
                transition: 'color .15s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { if (!pathname.startsWith('/services')) { e.currentTarget.style.color = '#334155'; } }}
            >
              SERVICES
            </Link>
            <Link 
              href="/chat" 
              className="nav-link"
              style={{ 
                fontSize: width >= 1280 ? '1rem' : '0.95rem',
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontWeight: pathname.startsWith('/chat') ? 700 : 600,
                color: pathname.startsWith('/chat') ? '#0f172a' : '#334155',
                transition: 'color .15s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { if (!pathname.startsWith('/chat')) { e.currentTarget.style.color = '#334155'; } }}
            >
              CHATBOT
            </Link>
          </nav>
        )}

                {/* Desktop CTA Buttons */}
                {shouldShowFullNav && (
                  <div className="flex items-center flex-shrink-0">
                    {/* Greeting + Login/Logout Button - Secondary CTA */}
                    {isAuthenticated && user && (
                      <>
                        <span style={{ marginRight: '12px', fontWeight: 600, color: '#374151' }}>
                          Hi, {user.username}
                        </span>
                        {((user as any).user_type === 'counselor' || (user as any).user_type === 'admin') && (
                          <Link
                            href="/counselor/dashboard"
                            style={{
                              marginRight: '12px',
                              padding: '8px 16px',
                              backgroundColor: '#6366f1',
                              color: 'white',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: 600,
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#4f46e5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#6366f1';
                            }}
                          >
                            Dashboard
                          </Link>
                        )}
                      </>
                    )}
                    {isAuthenticated ? (
                      <button 
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg font-semibold whitespace-nowrap transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                        style={{
                          fontSize: width >= 1280 ? '15px' : '14px',
                          padding: width >= 1280 ? '10px 20px' : '9px 18px',
                          fontWeight: 600,
                          letterSpacing: '0.3px',
                          backgroundColor: 'white',
                          border: '2px solid #ef4444',
                          color: '#ef4444',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                          minHeight: '40px',
                          cursor: 'pointer',
                          marginRight: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        Logout
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="rounded-lg font-semibold whitespace-nowrap transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                        style={{
                          fontSize: width >= 1280 ? '15px' : '14px',
                          padding: width >= 1280 ? '10px 20px' : '9px 18px',
                          fontWeight: 600,
                          letterSpacing: '0.3px',
                          backgroundColor: 'white',
                          border: '2px solid #9333ea',
                          color: '#9333ea',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)',
                          minHeight: '40px',
                          cursor: 'pointer',
                          marginRight: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#9333ea';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#9333ea';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(147, 51, 234, 0.2)';
                        }}
                      >
                        Login
                      </button>
                    )}
                    
                    {/* Start Support Button - Primary CTA */}
                    <Link 
                      href="/check-in" 
                      className="inline-block rounded-lg font-semibold whitespace-nowrap transition-all relative"
                      style={{
                        fontSize: width >= 1280 ? '15px' : '14px',
                        padding: width >= 1280 ? '10px 24px' : '9px 22px',
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                        border: 'none',
                        color: 'white',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f7931e 0%, #ff6b35 100%)';
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 53, 0.4)';
                      }}
                    >
                      Start Support
                    </Link>
                  </div>
                )}

        {/* Hamburger Menu - Shows only below laptop breakpoint */}
        {shouldShowHamburger && (
          <button
            type="button"
            className="text-black p-2 hover:text-orange-500 transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            style={{ fontSize: '1.5rem' }}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        )}
      </div>

      {/* Mobile Menu - Shows below laptop breakpoint */}
      {shouldShowHamburger && isMenuOpen && (
        <div 
          className="bg-white border-t shadow-lg"
          style={{ 
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50
          }}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col gap-3 p-4" role="navigation" aria-label="Mobile">
            <Link 
              href="/" 
              className="font-bold text-black hover:text-orange-500 transition-colors py-2 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              HOME
            </Link>
            <Link 
              href="/about" 
              className="font-bold text-black hover:text-orange-500 transition-colors py-2 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT
            </Link>
            <Link 
              href="/services/depression" 
              className="font-bold text-black hover:text-orange-500 transition-colors py-2 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              SERVICES
            </Link>
            <Link 
              href="/chat" 
              className="font-bold text-black hover:text-orange-500 transition-colors py-2 text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              CHATBOT
            </Link>
            {isAuthenticated && user && ((user as any).user_type === 'counselor' || (user as any).user_type === 'admin') && (
              <Link 
                href="/counselor/dashboard" 
                className="font-bold text-black hover:text-orange-500 transition-colors py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                DASHBOARD
              </Link>
            )}
            {isAuthenticated ? (
              <button 
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="transition-all px-6 py-3 rounded-full font-semibold text-center my-2 text-lg text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                style={{
                  backgroundColor: '#ef4444',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="transition-all px-6 py-3 rounded-full font-semibold text-center my-2 text-lg text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
                style={{
                  backgroundColor: '#9333ea',
                  boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                LogIn
              </button>
            )}
            <Link 
              href="/check-in" 
              className="transition-all px-6 py-3 rounded-full font-semibold text-center my-2 text-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                display: 'block',
                width: '100%'
              }}
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f7931e, #ff6b35)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b35, #f7931e)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
              }}
            >
              Start Support
            </Link>
          </nav>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}

