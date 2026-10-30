import { PhotographerUser, PhotographerSession } from './auth';
import { PhotographerProfileData, CustomPhoto } from './profileStorage';

// Firebase Firestore collections
export interface FirebasePhotographer {
  id: string;
  name: string;
  image: string;
  uniqueId: string;
  location?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    email?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface FirebasePhoto {
  id: string;
  title: string;
  photographer: string;
  photographerId: string;
  category: string;
  year: number;
  image: string;
  featured: boolean;
  createdAt: number;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  metadata?: {
    lastSignInAt?: number;
    creationTime?: number;
  };
}

// Mappers from localStorage to Firebase types
export function mapPhotographerToFirebase(photographer: PhotographerUser): FirebasePhotographer {
  return {
    id: photographer.uniqueId,
    name: photographer.name,
    image: photographer.image,
    uniqueId: photographer.uniqueId,
    location: photographer.location,
    social: photographer.social,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function mapPhotoToFirebase(photo: CustomPhoto): FirebasePhoto {
  return {
    id: photo.id || `photo-${Date.now()}`,
    title: photo.title,
    photographer: photo.photographer,
    photographerId: photo.photographerId,
    category: photo.category,
    year: photo.year,
    image: photo.image,
    featured: photo.featured || false,
    createdAt: photo.createdAt || Date.now(),
  };
}

export function mapFirebaseToPhotographer(firebasePhotographer: FirebasePhotographer): PhotographerUser {
  return {
    uniqueId: firebasePhotographer.uniqueId,
    name: firebasePhotographer.name,
    image: firebasePhotographer.image,
    location: firebasePhotographer.location,
  };
}

export function mapFirebaseToPhoto(firebasePhoto: FirebasePhoto): CustomPhoto {
  return {
    id: firebasePhoto.id,
    title: firebasePhoto.title,
    photographer: firebasePhoto.photographer,
    photographerId: firebasePhoto.photographerId,
    category: firebasePhoto.category,
    year: firebasePhoto.year,
    image: firebasePhoto.image,
    featured: firebasePhoto.featured,
    createdAt: firebasePhoto.createdAt,
  };
}
