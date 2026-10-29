export interface PhotographerUser {
  uniqueId: string;
  name: string;
  email: string;
  image: string;
  location?: string;
}

export interface PhotographerSession extends PhotographerUser {
  loggedInAt: number;
}

const AUTH_STORAGE_KEY = 'grufos_photographer_session';
export const AUTH_CHANGE_EVENT = 'grufos:auth-change';

export function getStoredPhotographer(): PhotographerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PhotographerSession;
  } catch (e) {
    console.error('Error reading auth state from localStorage:', e);
    return null;
  }
}

export function loginPhotographer(photographer: PhotographerUser): PhotographerSession {
  const session: PhotographerSession = {
    ...photographer,
    loggedInAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: session }));
  }

  return session;
}

export function logoutPhotographer(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
  }
}

export function subscribeToAuthChange(callback: (session: PhotographerSession | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<PhotographerSession | null>;
    callback(customEvent.detail ?? getStoredPhotographer());
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY) {
      callback(getStoredPhotographer());
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
