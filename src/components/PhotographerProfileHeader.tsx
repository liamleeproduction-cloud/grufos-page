import React, { useEffect, useState } from 'react';
import { getStoredPhotographer, type PhotographerSession } from '../utils/auth';
import { getCustomProfile } from '../utils/profileStorage';
import './PhotographerProfileHeader.scss';

interface Props {
  photographerId: string;
  defaultName: string;
}

export const PhotographerProfileHeader: React.FC<Props> = ({ photographerId, defaultName }) => {
  const [session, setSession] = useState<PhotographerSession | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const activeSession = getStoredPhotographer();
    setSession(activeSession);

    if (activeSession && (activeSession.uniqueId === photographerId || activeSession.name === defaultName)) {
      setIsOwner(true);
    }

    // Check if custom profile edits exist in localStorage
    const custom = getCustomProfile(photographerId);
    if (custom) {
      if (custom.name && custom.name !== defaultName) {
        const titleEl = document.querySelector('.photographer-content h1');
        if (titleEl) titleEl.textContent = custom.name;
        const svgTspans = document.querySelectorAll('.photographer-header svg text tspan');
        if (svgTspans.length > 0) {
          const words = custom.name.split(' ');
          svgTspans.forEach((span, i) => {
            if (words[i]) span.textContent = words[i];
          });
        }
      }
    }
  }, [photographerId, defaultName]);

  if (!mounted || !session) return null;

  return (
    <div className="profile-banner">
      <div className="profile-banner__content">
        <div className="profile-banner__info">
          <span className="profile-banner__dot" />
          <span>
            {isOwner ? (
              <strong>👋 ¡Hola, {session.name}! Estás viendo tu perfil público.</strong>
            ) : (
              <span>Sesión activa como <strong>{session.name}</strong>.</span>
            )}
          </span>
        </div>

        <div className="profile-banner__actions">
          <a href="/perfil" className="profile-banner__btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Modificar Nombre, Slug, About o Fotos</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfileHeader;
