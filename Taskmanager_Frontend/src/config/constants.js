// URL de base
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
import mypic from '../assets/images/defaultProfile.svg'

// URL de l'API
export const API_URL = `${BASE_URL}`;

// URL des médias, directement à la racine car servis comme fichiers statiques
export const MEDIA_URL = BASE_URL;

// Chemins des images
export const PROFILE_IMAGES = {
  // Images par défaut (relatif au frontend)
  DEFAULT: mypic,
  
  // Chemins pour les uploads (commence par /uploads comme défini dans app.js)
  UPLOAD_PATH: '/uploads/profiles/',  
  
  // Routes API (relatives à API_URL)
  API_ROUTES: {
    UPDATE_AVATAR: '/auth/users/update-avatar',
    GET_PROFILE: '/auth/users/profile',
    MEDIA_BASE: '/uploads'  // Route de base pour les fichiers statiques
  }
};

// Fonction utilitaire pour construire les URLs des médias
/**
 * Construit l'URL complète pour accéder aux médias
 * @param {string} path - Chemin relatif du média (ex: /uploads/profiles/image.jpg)
 * @returns {string} URL complète du média
 */
export const getMediaUrl = (path) => {
  if (!path) return PROFILE_IMAGES.DEFAULT;
  if (path.startsWith('http')) return path;
  
  // S'assurer que le chemin est bien un chemin /uploads
  let mediaPath = path;
  if (!path.startsWith('/uploads')) {
    mediaPath = path.startsWith('/') ? `/uploads${path}` : `/uploads/${path}`;
  }
  
  const fullUrl = `${MEDIA_URL}${mediaPath}`;
  
  // console.log('Construction URL média:', {
  //   originalPath: path,
  //   mediaPath,
  //   baseUrl: MEDIA_URL,
  //   fullUrl
  // });

  return fullUrl;
};

// Configurations des uploads
export const UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  MAX_DIMENSIONS: { width: 3840, height: 2160 }
};