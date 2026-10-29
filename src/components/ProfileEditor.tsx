import React, { useState, useEffect } from 'react';
import {
  getStoredPhotographer,
  loginPhotographer,
  type PhotographerSession,
  type PhotographerUser,
} from '../utils/auth';
import {
  getCustomProfile,
  saveCustomProfile,
  getCustomPhotos,
  addCustomPhoto,
  removeCustomPhoto,
  type CustomPhoto,
} from '../utils/profileStorage';
import './ProfileEditor.scss';

export interface PhotographerDetail extends PhotographerUser {
  about?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    email?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface PhotoItem {
  id: string;
  title: string;
  photographerId: string;
  category: string;
  year: number;
  image: string;
  featured?: boolean;
  isCustom?: boolean;
}

interface Props {
  initialPhotographers: PhotographerDetail[];
  initialPhotos: PhotoItem[];
}

export const ProfileEditor: React.FC<Props> = ({ initialPhotographers, initialPhotos }) => {
  const [session, setSession] = useState<PhotographerSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'gallery'>('profile');

  // Profile fields to modify
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [about, setAbout] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [social, setSocial] = useState({
    instagram: '',
    twitter: '',
    email: '',
    website: '',
  });

  // Gallery images
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoItem[]>([]);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'Nature',
    year: new Date().getFullYear(),
    image: '',
    featured: false,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setMounted(true);
    const currentSession = getStoredPhotographer();
    setSession(currentSession);

    if (currentSession) {
      loadPhotographerData(currentSession.uniqueId);
    }
  }, []);

  const loadPhotographerData = (photographerId: string) => {
    // 1. Base data from initial build
    const base = initialPhotographers.find((p) => p.uniqueId === photographerId);
    // 2. Custom override from localStorage
    const custom = getCustomProfile(photographerId);

    setName(custom?.name ?? base?.name ?? '');
    setSlug(custom?.uniqueId ?? base?.uniqueId ?? photographerId);
    setAbout(custom?.about ?? base?.about ?? '');
    setImage(custom?.image ?? base?.image ?? '');
    setLocation(custom?.location ?? base?.location ?? '');
    setSocial({
      instagram: custom?.social?.instagram ?? base?.social?.instagram ?? '',
      twitter: custom?.social?.twitter ?? base?.social?.twitter ?? '',
      email: custom?.social?.email ?? base?.email ?? '',
      website: custom?.social?.website ?? base?.social?.website ?? '',
    });

    // 3. Load photos
    const basePhotos = initialPhotos.filter((p) => p.photographerId === photographerId);
    const customPhotos = getCustomPhotos(photographerId);

    const mergedPhotos: PhotoItem[] = [
      ...customPhotos.map((cp) => ({
        id: cp.id,
        title: cp.title,
        photographerId: cp.photographerId,
        category: cp.category,
        year: cp.year,
        image: cp.image,
        featured: cp.featured,
        isCustom: true,
      })),
      ...basePhotos.map((bp) => ({ ...bp, isCustom: false })),
    ];

    setGalleryPhotos(mergedPhotos);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'La imagen excede el límite recomendado de 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (target === 'avatar') {
        setImage(dataUrl);
      } else {
        setNewPhoto((prev) => ({ ...prev, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    if (!trimmedName) {
      setNotification({ type: 'error', message: 'El nombre no puede estar vacío.' });
      return;
    }

    if (!trimmedSlug) {
      setNotification({ type: 'error', message: 'El slug no puede estar vacío.' });
      return;
    }

    // Save profile data
    const updatedProfile = {
      uniqueId: trimmedSlug,
      name: trimmedName,
      image: image.trim() || session.image,
      location: location.trim(),
      about: about.trim(),
      social,
    };

    saveCustomProfile(updatedProfile);

    // Also update current active session with new name, slug & image
    loginPhotographer({
      uniqueId: trimmedSlug,
      name: trimmedName,
      email: social.email || session.email,
      image: image.trim() || session.image,
      location: location.trim(),
    });

    setNotification({
      type: 'success',
      message: '¡Perfil actualizado con éxito! Tu nombre, slug y biografía han sido guardados.',
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    if (!newPhoto.title.trim()) {
      setNotification({ type: 'error', message: 'Por favor ingresa un título para la imagen.' });
      return;
    }

    if (!newPhoto.image.trim()) {
      setNotification({ type: 'error', message: 'Por favor ingresa una URL de imagen o sube un archivo.' });
      return;
    }

    const created = addCustomPhoto({
      title: newPhoto.title.trim(),
      photographer: name || session.name,
      photographerId: slug || session.uniqueId,
      category: newPhoto.category,
      year: Number(newPhoto.year) || new Date().getFullYear(),
      image: newPhoto.image.trim(),
      featured: newPhoto.featured,
    });

    setGalleryPhotos((prev) => [
      {
        id: created.id,
        title: created.title,
        photographerId: created.photographerId,
        category: created.category,
        year: created.year,
        image: created.image,
        featured: created.featured,
        isCustom: true,
      },
      ...prev,
    ]);

    setNewPhoto({
      title: '',
      category: 'Nature',
      year: new Date().getFullYear(),
      image: '',
      featured: false,
    });

    setNotification({
      type: 'success',
      message: '¡Imagen agregada con éxito a tu galería!',
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!session) return;
    removeCustomPhoto(slug || session.uniqueId, photoId);
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setNotification({ type: 'success', message: 'Imagen eliminada de la galería.' });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!mounted) {
    return <div className="profile-editor-loading">Cargando editor de perfil...</div>;
  }

  // If user is not logged in
  if (!session) {
    return (
      <div className="profile-editor-unauth">
        <div className="profile-editor-unauth__card">
          <div className="profile-editor-unauth__icon">🔒</div>
          <h2>Acceso Restringido a Fotógrafos</h2>
          <p>Debes iniciar sesión con tu cuenta de fotógrafo para modificar tu nombre, slug, biografía y agregar imágenes a tu galería.</p>
          <a href="/login" className="editor-btn editor-btn--primary">
            Iniciar Sesión como Fotógrafo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-editor-container">
      {/* Top Header */}
      <div className="profile-editor__header">
        <div className="profile-editor__header-info">
          <div className="profile-editor__header-avatar-box">
            <img src={image || session.image} alt={name || session.name} className="profile-editor__header-avatar" />
            <span className="profile-editor__header-badge" title="Sesión activa" />
          </div>
          <div>
            <h1>Panel de Fotógrafo: {name || session.name}</h1>
            <p className="profile-editor__header-sub">
              ID / Slug: <code>{slug || session.uniqueId}</code> • Sesión activa
            </p>
          </div>
        </div>

        <div className="profile-editor__header-actions">
          <a href={`/fotografos/${slug || session.uniqueId}`} className="editor-btn editor-btn--outline" target="_blank" rel="noreferrer">
            <span>👁️ Ver Mi Perfil Público</span>
          </a>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`editor-alert editor-alert--${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="editor-tabs">
        <button
          type="button"
          className={`editor-tab ${activeTab === 'profile' ? 'editor-tab--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Modificar Perfil (Nombre, Slug, About)</span>
        </button>

        <button
          type="button"
          className={`editor-tab ${activeTab === 'gallery' ? 'editor-tab--active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Galería de Imágenes ({galleryPhotos.length})</span>
        </button>
      </div>

      {/* TAB 1: MODIFICAR PERFIL */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="editor-form">
          <div className="editor-card">
            <h2 className="editor-card__title">
              <span>👤 Información Básica</span>
            </h2>

            <div className="editor-grid-2">
              <div className="form-field">
                <label htmlFor="input-name">Nombre Completo *</label>
                <input
                  id="input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
                <span className="field-hint">Aparece en tu tarjeta, encabezado y galería.</span>
              </div>

              <div className="form-field">
                <label htmlFor="input-slug">Slug / Identificador URL *</label>
                <div className="slug-input-wrapper">
                  <span className="slug-prefix">/fotografos/</span>
                  <input
                    id="input-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    placeholder="tu-nombre-o-slug"
                    required
                  />
                </div>
                <span className="field-hint">Identificador único en la URL de tu página de fotógrafo.</span>
              </div>
            </div>

            <div className="editor-grid-2">
              <div className="form-field">
                <label htmlFor="input-location">Ubicación</label>
                <input
                  id="input-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ej. Madrid, España / New York, USA"
                />
              </div>

              <div className="form-field">
                <label htmlFor="input-image">Foto de Perfil (Avatar)</label>
                <input
                  id="input-image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="URL de la imagen (https://...)"
                />
                <div className="file-upload-row">
                  <span>o subir archivo:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="file-input-compact"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="editor-card">
            <div className="editor-card__header-row">
              <h2 className="editor-card__title">
                <span>📝 Acerca de Mí (About / Biografía)</span>
              </h2>
              <div className="editor-view-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${previewTab === 'edit' ? 'toggle-btn--active' : ''}`}
                  onClick={() => setPreviewTab('edit')}
                >
                  Editar Texto
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${previewTab === 'preview' ? 'toggle-btn--active' : ''}`}
                  onClick={() => setPreviewTab('preview')}
                >
                  Vista Previa
                </button>
              </div>
            </div>

            {previewTab === 'edit' ? (
              <div className="form-field">
                <textarea
                  rows={8}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Escribe tu historia, especialidad fotográfica, exposiciones o visión artística..."
                />
                <span className="field-hint">Soporta texto y Markdown (títulos con ###, negritas con **, etc.)</span>
              </div>
            ) : (
              <div className="about-preview-box">
                {about ? (
                  <div className="about-preview-content">
                    {about.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('###')) {
                        return <h3 key={idx}>{paragraph.replace(/^###\s*/, '')}</h3>;
                      }
                      if (paragraph.startsWith('##')) {
                        return <h2 key={idx}>{paragraph.replace(/^##\s*/, '')}</h2>;
                      }
                      return <p key={idx}>{paragraph}</p>;
                    })}
                  </div>
                ) : (
                  <p className="about-preview-empty">Aún no has escrito tu biografía.</p>
                )}
              </div>
            )}
          </div>

          <div className="editor-card">
            <h2 className="editor-card__title">
              <span>🌐 Enlaces y Redes Sociales</span>
            </h2>

            <div className="editor-grid-2">
              <div className="form-field">
                <label>Instagram</label>
                <input
                  type="text"
                  value={social.instagram}
                  onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                  placeholder="https://instagram.com/tu-usuario"
                />
              </div>

              <div className="form-field">
                <label>Twitter / X</label>
                <input
                  type="text"
                  value={social.twitter}
                  onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                  placeholder="https://twitter.com/tu-usuario"
                />
              </div>

              <div className="form-field">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={social.email}
                  onChange={(e) => setSocial({ ...social, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-field">
                <label>Sitio Web Personal</label>
                <input
                  type="url"
                  value={social.website}
                  onChange={(e) => setSocial({ ...social, website: e.target.value })}
                  placeholder="https://tuportafolio.com"
                />
              </div>
            </div>
          </div>

          <div className="editor-actions-bar">
            <button type="submit" className="editor-btn editor-btn--primary editor-btn--lg">
              💾 Guardar Cambios del Perfil
            </button>
            <a href={`/fotografos/${slug || session.uniqueId}`} className="editor-btn editor-btn--outline editor-btn--lg">
              Ver Perfil Actualizado →
            </a>
          </div>
        </form>
      )}

      {/* TAB 2: GESTIONAR Y AGREGAR IMÁGENES */}
      {activeTab === 'gallery' && (
        <div className="gallery-manager">
          {/* Add Image Card */}
          <div className="editor-card">
            <h2 className="editor-card__title">
              <span>➕ Agregar Nueva Imagen a tu Galería</span>
            </h2>

            <form onSubmit={handleAddPhoto} className="add-photo-form">
              <div className="editor-grid-2">
                <div className="form-field">
                  <label htmlFor="photo-title">Título de la Fotografía *</label>
                  <input
                    id="photo-title"
                    type="text"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    placeholder="ej. Amanecer en las Montañas"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="photo-category">Categoría</label>
                  <select
                    id="photo-category"
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                  >
                    <option value="Nature">Naturaleza / Paisaje</option>
                    <option value="Portrait">Retrato</option>
                    <option value="Street">Fotografía Callejera</option>
                    <option value="Architecture">Arquitectura</option>
                    <option value="Urban">Urbano</option>
                    <option value="Travel">Viajes</option>
                    <option value="Abstract">Abstracto</option>
                    <option value="Beach">Playa / Mar</option>
                  </select>
                </div>
              </div>

              <div className="editor-grid-2">
                <div className="form-field">
                  <label htmlFor="photo-year">Año de captura</label>
                  <input
                    id="photo-year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={newPhoto.year}
                    onChange={(e) => setNewPhoto({ ...newPhoto, year: Number(e.target.value) })}
                  />
                </div>

                <div className="form-field">
                  <label>Opciones rápidas</label>
                  <div className="preset-buttons">
                    <button
                      type="button"
                      className="preset-btn"
                      onClick={() =>
                        setNewPhoto({
                          ...newPhoto,
                          image: `https://picsum.photos/seed/${Math.floor(Math.random() * 900) + 100}/1200/800`,
                        })
                      }
                    >
                      🎲 Imagen Aleatoria HD
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="photo-image">URL de la Imagen *</label>
                <input
                  id="photo-image"
                  type="text"
                  value={newPhoto.image}
                  onChange={(e) => setNewPhoto({ ...newPhoto, image: e.target.value })}
                  placeholder="https://images.unsplash.com/... o https://picsum.photos/..."
                  required
                />
                <div className="file-upload-row">
                  <span>o selecciona un archivo local de tu equipo:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="file-input-compact"
                  />
                </div>
              </div>

              {newPhoto.image && (
                <div className="new-photo-preview">
                  <span className="preview-label">Vista Previa de la imagen:</span>
                  <img src={newPhoto.image} alt="Preview" className="preview-thumb" />
                </div>
              )}

              <button type="submit" className="editor-btn editor-btn--primary">
                ➕ Agregar Imagen a mi Galería
              </button>
            </form>
          </div>

          {/* Current Gallery List */}
          <div className="editor-card">
            <h2 className="editor-card__title">
              <span>🖼️ Fotografías en tu Galería ({galleryPhotos.length})</span>
            </h2>

            {galleryPhotos.length === 0 ? (
              <p className="empty-gallery-msg">Aún no hay fotografías asociadas a tu galería.</p>
            ) : (
              <div className="gallery-grid-editor">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="gallery-item-editor">
                    <div className="gallery-item-editor__img-box">
                      <img src={photo.image} alt={photo.title} />
                      {photo.isCustom && <span className="custom-badge">Agregada por ti</span>}
                    </div>
                    <div className="gallery-item-editor__info">
                      <h4>{photo.title}</h4>
                      <div className="gallery-item-editor__meta">
                        <span className="tag">{photo.category}</span>
                        <span className="year">{photo.year}</span>
                      </div>
                    </div>
                    {photo.isCustom && (
                      <button
                        type="button"
                        className="delete-photo-btn"
                        onClick={() => handleDeletePhoto(photo.id)}
                        title="Eliminar esta foto agregada"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
