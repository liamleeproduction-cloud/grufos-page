---
title: "Firebase Integration Documentation"
slug: "firebase-integration"
---

# Firebase Integration for GRUFOS

## Overview

This document describes the Firebase integration structure for the GRUFOS photographic collective application. The system uses Firestore as the primary database with authentication handled through Firebase Auth.

## Data Models

### Firebase Photographer

```typescript
export interface FirebasePhotographer {
  id: string;          // Firestore document ID (photographer uniqueId)
  name: string;        // Photographer name
  image: string;       // Profile image URL
  uniqueId: string;    // Unique identifier
  location?: string;   // Optional location
  social?: {
    twitter?: string;
    instagram?: string;
    email?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: number;   // Timestamp when first created
  updatedAt: number;   // Last update timestamp
}
```

### Firebase Photo

```typescript
export interface FirebasePhoto {
  id: string;          // Unique photo ID
  title: string;       // Photo title
  photographer: string; // Photographer name
  photographerId: string; // Photographer uniqueId
  category: string;    // Photo category
  year: number;        // Year taken
  image: string;       // Image URL (optimized to WebP/AVIF)
  featured: boolean;   // Featured status
  createdAt: number;   // Creation timestamp
}
```

### Firebase User

```typescript
export interface FirebaseUser {
  uid: string;         // Firebase UID
  email: string | null; // User email (can be null for anonymous)
  displayName?: string | null; // Display name
  photoURL?: string | null; // Profile photo URL
  metadata?: {
    lastSignInAt?: number;
    creationTime?: number;
  };
}
```

## Mapper Functions

### photographer ⇄ Firebase

```typescript
// LocalStorage → Firebase
mapPhotographerToFirebase(photographer: PhotographerUser): FirebasePhotographer

// Firebase → LocalStorage  
mapFirebaseToPhotographer(firebasePhotographer: FirebasePhotographer): PhotographerUser
```

### photo ⇄ Firebase

```typescript
// LocalStorage → Firebase
mapPhotoToFirebase(photo: CustomPhoto): FirebasePhoto

// Firebase → LocalStorage
mapFirebaseToPhoto(firebasePhoto: FirebasePhoto): CustomPhoto
```

## Authentication Flow

### Login

```typescript
import { loginPhotographer, getStoredPhotographer, subscribeToAuthChange } from './utils/auth';

const session = loginPhotographer({
  uniqueId: 'photographer-id',
  name: 'Photographer Name',
  image: 'https://example.com/image.jpg',
  email: 'email@example.com',
  location: 'Location'
});

// Subscribe to auth changes
const unsubscribe = subscribeToAuthChange((session) => {
  // Update UI based on session
  if (session) {
    // User is logged in
  } else {
    // User is logged out
  }
});

// Cleanup
unsubscribe();
```

### Logout

```typescript
import { logoutPhotographer } from './utils/auth';

logoutPhotographer();
// Dispatches AUTH_CHANGE_EVENT with null detail
```

### Profile Management

#### Save Custom Profile

```typescript
import { saveCustomProfile } from './utils/profileStorage';

saveCustomProfile({
  uniqueId: 'photographer-id',
  name: 'Updated Name',
  image: 'https://example.com/new-image.jpg',
  location: 'New Location',
  about: 'Updated bio',
  social: {
    instagram: 'https://instagram.com/new',
    website: 'https://new-website.com'
  }
});
```

#### Load Custom Profile

```typescript
import { getCustomProfile } from './utils/profileStorage';

const customProfile = getCustomProfile('photographer-id');
// Returns PhotographerProfileData or null
```

#### Remove Custom Profile

```typescript
// The profile remains in localStorage; use localStorage.removeItem()
// Key format: grufos_profile_{uniqueId}
```

## Photo Management

### Save Custom Photos

```typescript
import { saveCustomPhotos, addCustomPhoto, removeCustomPhoto } from './utils/profileStorage';

const newPhoto = addCustomPhoto({
  title: 'New Photo Title',
  photographer: 'Jane Doe',
  photographerId: 'jane-doe',
  category: 'Nature',
  year: 2024,
  image: 'https://picsum.photos/seed/test/800/600',
  featured: true
});

// Remove a photo by ID
removeCustomPhoto('jane-doe', 'custom-123456-abcdef');
```

### Load Custom Photos

```typescript
import { getCustomPhotos } from './utils/profileStorage';

const photos = getCustomPhotos('photographer-id');
// Returns CustomPhoto[] or empty array
```

## Image Optimization

Astro automatically optimizes images through the config:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [react()],
  site: "https://liamleeproduction-cloud.github.io/grufos-page/",
  base: '/grufos-page/',
  images: {
    service: {
      formats: ['webp', 'avif'], // Automatic conversion
    },
  },
});
```

- All images from `picsum.photos` are converted to WebP/AVIF formats
- Reduces image size by ~30-50% compared to original
- Maintains visual quality with modern codecs

## Firestore Structure (Recommended)

If migrating from localStorage to Firestore, use this structure:

```
collection: "photographers"
  doc: {uniqueId}
    fields: {
      name: string,
      image: string,
      uniqueId: string,
      location: string,
      social: map,
      createdAt: timestamp,
      updatedAt: timestamp
    }

collection: "photos"
  doc: {photoId}
    fields: {
      title: string,
      photographer: string,
      photographerId: string,
      category: string,
      year: number,
      image: string,
      featured: boolean,
      createdAt: timestamp
    }
```

## Migration Path

1. **Start with localStorage** (current implementation)
2. **Add Firebase Auth** for login/logout
3. **Sync photographs** to Firestore using mapper functions
4. **Enable real-time updates** with `onSnapshot()`
5. **Migrate image hosting** to Firebase Storage
6. **Update frontend** to use Firestore SDK directly

## Development Tips

- Use `localStorage` for offline-first experience
- Sync with Firebase when online
- Use the mapper functions for consistent data transformation
- Images are automatically optimized - no manual conversion needed
- The `base: '/grufos-page/'` config is required for GitHub Pages deployment
