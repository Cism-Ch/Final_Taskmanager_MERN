import axios from 'axios';

// Configure l'intercepteur axios pour inclure automatiquement le token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Si le token est invalide/expiré, déconnexion
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response.status === 403 && error.response.data?.message?.includes('not activated')) {
                // Rediriger vers la page d'activation requise
                window.location.href = '/activation-required';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;