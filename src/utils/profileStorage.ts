export interface PhotographerProfileData {
  uniqueId: string;
  name: string;
  image: string;
  location?: string;
  about: string;
  social?: {
    twitter?: string;
    instagram?: string;
    email?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  lastUpdated?: number;
}

export interface CustomPhoto {
  id: string;
  title: string;
  photographer: string;
  photographerId: string;
  category: string;
  year: number;
  image: string;
  featured?: boolean;
  createdAt: number;
}

const PROFILE_STORAGE_PREFIX = 'grufos_profile_';
const PHOTOS_STORAGE_PREFIX = 'grufos_photos_';
export const PROFILE_UPDATE_EVENT = 'grufos:profile-update';
export const PHOTOS_UPDATE_EVENT = 'grufos:photos-update';

export function getCustomProfile(uniqueId: string): PhotographerProfileData | null {
  if (typeof window === 'undefined' || !uniqueId) return null;
  try {
    const raw = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${uniqueId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PhotographerProfileData;
  } catch (e) {
    console.error('Error reading custom profile:', e);
    return null;
  }
}

export function saveCustomProfile(profile: PhotographerProfileData): void {
  if (typeof window === 'undefined' || !profile.uniqueId) return;
  profile.lastUpdated = Date.now();
  localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${profile.uniqueId}`, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATE_EVENT, { detail: profile }));
}

export function getCustomPhotos(photographerId: string): CustomPhoto[] {
  if (typeof window === 'undefined' || !photographerId) return [];
  try {
    const raw = localStorage.getItem(`${PHOTOS_STORAGE_PREFIX}${photographerId}`);
    if (!raw) return [];
    return JSON.parse(raw) as CustomPhoto[];
  } catch (e) {
    console.error('Error reading custom photos:', e);
    return [];
  }
}

export function saveCustomPhotos(photographerId: string, photos: CustomPhoto[]): void {
  if (typeof window === 'undefined' || !photographerId) return;
  localStorage.setItem(`${PHOTOS_STORAGE_PREFIX}${photographerId}`, JSON.stringify(photos));
  window.dispatchEvent(new CustomEvent(PHOTOS_UPDATE_EVENT, { detail: { photographerId, photos } }));
}

export function addCustomPhoto(photo: Omit<CustomPhoto, 'id' | 'createdAt'>): CustomPhoto {
  const existing = getCustomPhotos(photo.photographerId);
  const newPhoto: CustomPhoto = {
    ...photo,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };

  const updated = [newPhoto, ...existing];
  saveCustomPhotos(photo.photographerId, updated);
  return newPhoto;
}

export function removeCustomPhoto(photographerId: string, photoId: string): void {
  const existing = getCustomPhotos(photographerId);
  const updated = existing.filter((p) => p.id !== photoId);
  saveCustomPhotos(photographerId, updated);
}
