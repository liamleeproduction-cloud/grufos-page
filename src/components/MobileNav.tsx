import React, { useEffect, useState } from 'react';
import { getStoredPhotographer, logoutPhotographer, subscribeToAuthChange, type PhotographerSession } from '../utils/auth';
import './MobileNav.scss';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<PhotographerSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getStoredPhotographer());

    const unsubscribe = subscribeToAuthChange((newSession) => {
      setSession(newSession);
      if (!newSession) setIsOpen(false);
    });

    return () => unsubscribe();
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logoutPhotographer();
    setIsOpen(false);
    window.location.href = '/';
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className={`mobile-nav__toggle${isOpen ? ' mobile-nav__toggle--open' : ''}`}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="mobile-nav__bar" />
        <span className="mobile-nav__bar" />
        <span className="mobile-nav__bar" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="mobile-nav__backdrop"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-nav__drawer${isOpen ? ' mobile-nav__drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación principal"
      >
        {/* Header inside drawer */}
        <div className="mobile-nav__drawer-header">
          <span className="mobile-nav__drawer-logo">GRUFOS</span>
          <button
            type="button"
            className="mobile-nav__close"
            aria-label="Cerrar menú"
            onClick={() => setIsOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="mobile-nav__links">
          <a href="/" className="mobile-nav__link" onClick={handleNavClick}>
            Inicio
          </a>
          <a href="/fotografos" className="mobile-nav__link" onClick={handleNavClick}>
            Fotógrafos
          </a>
          <a href="/acerca" className="mobile-nav__link" onClick={handleNavClick}>
            Acerca
          </a>
        </nav>

        {/* Auth section */}
        <div className="mobile-nav__auth">
          {mounted && session ? (
            <div className="mobile-nav__user">
              <div className="mobile-nav__user-info">
                <img
                  src={session.image}
                  alt={session.name}
                  className="mobile-nav__avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/id/238/200/300';
                  }}
                />
                <div className="mobile-nav__user-details">
                  <span className="mobile-nav__user-name">{session.name}</span>
                  <span className="mobile-nav__user-status">
                    <span className="mobile-nav__status-dot" /> Conectado
                  </span>
                </div>
              </div>

              <div className="mobile-nav__user-actions">
                <a href="/perfil" className="mobile-nav__action-link" onClick={handleNavClick}>
                  Mi Perfil &amp; Galería
                </a>
                <a href={`/fotografos/${session.uniqueId}`} className="mobile-nav__action-link" onClick={handleNavClick}>
                  Ver Perfil Público
                </a>
                <button type="button" className="mobile-nav__action-logout" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <a href="/login" className="mobile-nav__login-btn" onClick={handleNavClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNav;
