import React, { useEffect, useState, useRef } from 'react';
import { getStoredPhotographer, logoutPhotographer, subscribeToAuthChange, type PhotographerSession } from '../utils/auth';
import './UserMenu.scss';

export const UserMenu: React.FC = () => {
  const [session, setSession] = useState<PhotographerSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSession(getStoredPhotographer());

    const unsubscribe = subscribeToAuthChange((newSession) => {
      setSession(newSession);
      if (!newSession) {
        setIsOpen(false);
      }
    });

    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    logoutPhotographer();
    setIsOpen(false);
    window.location.href = '/';
  };

  // During SSR or before mounting, render an empty placeholder or login button to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="user-menu-container">
        <a href="/login" className="user-menu__login-btn">
          <svg className="user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Login</span>
        </a>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="user-menu-container">
        <a href="/login" className="user-menu__login-btn">
          <svg className="user-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>Login</span>
        </a>
      </div>
    );
  }

  const firstName = session.name.split(' ')[0];

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        title={`Conectado como ${session.name}`}
      >
        <div className="user-menu__avatar-wrapper">
          <img
            src={session.image}
            alt={session.name}
            className="user-menu__avatar"
            onError={(e) => {
              // Fallback placeholder if image fails to load
              (e.target as HTMLImageElement).src = 'https://picsum.photos/id/238/200/300';
            }}
          />
          <span className="user-menu__online-badge" title="Sesión activa" />
        </div>
        <span className="user-menu__name">{firstName}</span>
        <svg
          className={`user-menu__caret ${isOpen ? 'user-menu__caret--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__dropdown-header">
            <div className="user-menu__dropdown-avatar-wrapper">
              <img src={session.image} alt={session.name} className="user-menu__dropdown-avatar" />
              <span className="user-menu__dropdown-online-dot" />
            </div>
            <div className="user-menu__dropdown-info">
              <span className="user-menu__dropdown-name">{session.name}</span>
              <span className="user-menu__dropdown-status">
                <span className="user-menu__status-dot" /> Conectado
              </span>
              <span className="user-menu__dropdown-email">{session.email}</span>
            </div>
          </div>

          <div className="user-menu__dropdown-divider" />

          <div className="user-menu__dropdown-actions">
            <a
              href="/perfil"
              className="user-menu__dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Mi Perfil & Galería</span>
            </a>

            <a
              href={`/fotografos/${session.uniqueId}`}
              className="user-menu__dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Ver Perfil Público</span>
            </a>

            <button
              type="button"
              className="user-menu__dropdown-item user-menu__dropdown-item--logout"
              onClick={handleLogout}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
