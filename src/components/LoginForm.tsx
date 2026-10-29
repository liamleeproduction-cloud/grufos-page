import React, { useState, useEffect } from 'react';
import {
  getStoredPhotographer,
  loginPhotographer,
  logoutPhotographer,
  type PhotographerUser,
  type PhotographerSession,
} from '../utils/auth';
import './LoginForm.scss';

interface Props {
  photographers: PhotographerUser[];
}

export const LoginForm: React.FC<Props> = ({ photographers }) => {
  const [session, setSession] = useState<PhotographerSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getStoredPhotographer();
    setSession(existing);
    if (photographers.length > 0 && !selectedId) {
      setSelectedId(photographers[0].uniqueId);
      setIdentifier(photographers[0].email || photographers[0].uniqueId);
    }
  }, [photographers]);

  const handleSelectPhotographer = (p: PhotographerUser) => {
    setSelectedId(p.uniqueId);
    setIdentifier(p.email || p.uniqueId);
    setError('');
  };

  const handleQuickLogin = (p: PhotographerUser) => {
    setIsSubmitting(true);
    setError('');
    const newSession = loginPhotographer(p);
    setSession(newSession);
    setSuccessMsg(`¡Bienvenido de nuevo, ${p.name}! Redirigiendo a tu perfil...`);
    setTimeout(() => {
      window.location.href = `/fotografos/${p.uniqueId}`;
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = identifier.trim().toLowerCase();
    if (!trimmed) {
      setError('Por favor ingresa tu correo electrónico o identificador de fotógrafo.');
      return;
    }

    // Match by email, uniqueId, or name
    const found = photographers.find(
      (p) =>
        p.email.toLowerCase() === trimmed ||
        p.uniqueId.toLowerCase() === trimmed ||
        p.name.toLowerCase() === trimmed
    );

    if (!found) {
      setError(
        'No se encontró ningún fotógrafo con ese correo o usuario. Puedes seleccionar uno de la lista a continuación.'
      );
      return;
    }

    setIsSubmitting(true);
    const newSession = loginPhotographer(found);
    setSession(newSession);
    setSuccessMsg(`¡Bienvenido/a, ${found.name}! Redirigiendo a tu perfil...`);
    setTimeout(() => {
      window.location.href = `/fotografos/${found.uniqueId}`;
    }, 700);
  };

  const handleLogout = () => {
    logoutPhotographer();
    setSession(null);
    setSuccessMsg('');
    setError('');
  };

  if (!mounted) {
    return <div className="login-card login-card--loading">Cargando formulario de acceso...</div>;
  }

  if (session) {
    return (
      <div className="login-card login-card--logged-in">
        <div className="login-card__active-badge">
          <span className="login-card__pulse-dot" /> Sesión Activa
        </div>

        <div className="login-card__user-preview">
          <div className="login-card__avatar-box">
            <img src={session.image} alt={session.name} className="login-card__user-avatar" />
            <span className="login-card__user-dot" />
          </div>
          <h2>{session.name}</h2>
          <p className="login-card__user-email">{session.email}</p>
          {session.location && <p className="login-card__user-location">📍 {session.location}</p>}
        </div>

        <p className="login-card__notice">
          Ya has iniciado sesión como fotógrafo miembro. Tu avatar y estado activo ahora se muestran en el encabezado de todas las páginas.
        </p>

        <div className="login-card__actions">
          <a href={`/fotografos/${session.uniqueId}`} className="login-card__btn login-card__btn--primary">
            Ver Mi Galería & Perfil
          </a>
          <button type="button" onClick={handleLogout} className="login-card__btn login-card__btn--outline">
            Cerrar Sesión / Cambiar de cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <h1>Acceso para Fotógrafos</h1>
          <p>Inicia sesión con tu cuenta de fotógrafo para identificarte en el colectivo.</p>
        </div>

        {error && <div className="login-alert login-alert--error">{error}</div>}
        {successMsg && <div className="login-alert login-alert--success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Correo o ID de Fotógrafo</label>
            <div className="input-wrapper">
              <input
                id="identifier"
                type="text"
                placeholder="ej. jane.doe@example.com o jane-doe"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <span className="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña (demo: cualquier clave)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-icon input-icon--btn"
                onClick={() => setShowPassword((p) => !p)}
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            <span className="form-hint">Para fines de demostración, cualquier contraseña es válida.</span>
          </div>

          <button
            type="submit"
            className="login-card__btn login-card__btn--primary login-card__btn--block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Entrar como Fotógrafo'}
          </button>
        </form>

        <div className="login-divider">
          <span>o accede en 1 clic como miembro</span>
        </div>

        <div className="quick-select">
          <p className="quick-select__title">Selecciona tu perfil de fotógrafo:</p>
          <div className="quick-select__grid">
            {photographers.map((p) => (
              <button
                key={p.uniqueId}
                type="button"
                className={`quick-select__card ${selectedId === p.uniqueId ? 'quick-select__card--selected' : ''}`}
                onClick={() => handleQuickLogin(p)}
                disabled={isSubmitting}
                title={`Entrar como ${p.name}`}
              >
                <img src={p.image} alt={p.name} className="quick-select__avatar" />
                <div className="quick-select__info">
                  <span className="quick-select__name">{p.name}</span>
                  <span className="quick-select__role">{p.location || 'Fotógrafo'}</span>
                </div>
                <span className="quick-select__arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
