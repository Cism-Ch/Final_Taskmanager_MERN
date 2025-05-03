import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig"; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const initialState = {
    user: null,
    isAuthenticated: false,
    token: null,
    status: 'idle',
    error: null,
    isActive: false,
    isOk: false,
    message: null,
    userStats: null,
    onlineStatus: 'offline',
    userTasks: [],
    taskLoadingStatus: 'idle',
    taskError: null,
    profileUpdate: {
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    emailChange: {
        status: 'idle', // 'idle' | 'pending' | 'verified' | 'failed'
        error: null,
        pendingEmail: null
    }
};

export const stateValidationMiddleware = (store) => (next) => (action) => {
    const result = next(action);
    const state = store.getState();
    
    if (state.auth) {
        // Vérifier et initialiser emailChange si nécessaire
        if (!state.auth.emailChange) {
            store.dispatch({
                type: 'auth/repairState',
                payload: {
                    target: 'emailChange',
                    value: {
                        status: 'idle',
                        error: null,
                        pendingEmail: null
                    }
                }
            });
        }
        
        // Vérifier la cohérence du status
        if (!['idle', 'pending', 'verified', 'failed'].includes(state.auth.emailChange?.status)) {
            store.dispatch({
                type: 'auth/resetEmailChange'
            });
        }
    }
    
    return result;
};

export const authenticate = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, payload);
        if (response.status === 204) {
            return rejectWithValue('Erreur de connexion: aucune donnée reçue');
        }
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Erreur lors de la connexion');
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    localStorage.removeItem('token');
    return null;
});

export const register = createAsyncThunk('auth/register', async (payload) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, payload);
    return data;
});

export const activation = createAsyncThunk(
    'auth/activation',
    async (activationData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/activation`, activationData);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Erreur d\'activation'
            });
        }
    }
);

export const getProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
    try {
        console.log('Début getProfile - Requête au backend');
        // Changer l'URL pour utiliser la route correcte
        const { data } = await axios.get(`${API_URL}/auth/users/profile`);
        console.log('Réponse getProfile:', data);

        if (!data) {
            console.error('Aucune donnée reçue du backend');
            return rejectWithValue({
                code: 404,
                message: 'Aucune donnée de profil reçue'
            });
        }

        // Retourner les données avec la structure attendue
        return {
            status: 200,
            message: "Profil récupéré avec succès",
            data: data
        };
    } catch (err) {
        console.error('Erreur getProfile:', err);
        return rejectWithValue({
            code: err.response?.status || 500,
            message: err.response?.data?.message || 'Erreur lors de la récupération du profil'
        });
    }
});

export const updateProfile = createAsyncThunk(
    'auth/users/update-profile',
    async (profileData, { dispatch, getState, rejectWithValue }) => {
        try {
            const currentUser = getState().auth.user; // Récupérer l'état actuel
            console.log('Données envoyées à l\'API:', profileData);
            const { data } = await axios.put(`${API_URL}/auth/users/update-profile`, profileData);
            console.log('Réponse de l\'API:', data);
            // Forcer un rafraîchissement complet du profil
            await dispatch(getProfile());
            // Fusionner immédiatement les nouvelles données avec l'état actuel
            const updatedUser = {
                ...currentUser,
                ...data,
                updatedAt: new Date().toISOString()
            };

            // Mettre à jour les stats après la mise à jour du profil
            console.log('Mise à jour des statistiques utilisateur');
            dispatch(getUserStats());
            return updatedUser; // Retourner l'utilisateur fusionné
        } catch (err) {
            console.error('Erreur updateProfile:', err.response?.data);
            const errorCode = err.response?.status || 500;
            let errorMessage = 'Erreur lors de la mise à jour du profil';

            switch (errorCode) {
                case 400:
                    errorMessage = 'Données de profil invalides';
                    break;
                case 401:
                    errorMessage = 'Session expirée, veuillez vous reconnecter';
                    break;
                case 403:
                    errorMessage = 'Accès non autorisé';
                    break;
                case 404:
                    errorMessage = 'Profil non trouvé';
                    break;
                case 409:
                    errorMessage = 'Cette adresse email est déjà utilisée';
                    break;
                case 413:
                    errorMessage = 'Image trop volumineuse';
                    break;
                case 415:
                    errorMessage = 'Format de fichier non supporté';
                    break;
                case 429:
                    errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';
                    break;
            }

            console.log('Message d\'erreur généré:', errorMessage);
            return rejectWithValue({
                code: errorCode,
                message: err.response?.data?.message || errorMessage
            });
        }
    }
);

export const updateAvatar = createAsyncThunk(
    'auth/update-avatar',
    async (formData, { dispatch, rejectWithValue }) => {
        try {
            console.log('Envoi de la requête updateAvatar');
            const { data } = await axios.put(
                `${API_URL}/auth/users/update-avatar`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log('Réponse updateAvatar:', data);
            
            // Mettre à jour les stats et le profil après la mise à jour de l'avatar
            if (data.success) {
                dispatch(getUserStats());
                dispatch(getProfile());
            }
            
            return data;
        } catch (err) {
            const errorCode = err.response?.status || 500;
            let errorMessage = 'Erreur lors de la mise à jour de l\'avatar';

            switch (errorCode) {
                case 400:
                    errorMessage = 'Format d\'image invalide';
                    break;
                case 401:
                    errorMessage = 'Session expirée, veuillez vous reconnecter';
                    break;
                case 413:
                    errorMessage = 'Image trop volumineuse (max 5MB)';
                    break;
                case 415:
                    errorMessage = 'Format de fichier non supporté (JPG, PNG ou WebP uniquement)';
                    break;
                case 429:
                    errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';
                    break;
            }

            return rejectWithValue({
                code: errorCode,
                message: err.response?.data?.message || errorMessage
            });
        }
    }
);

export const getUserStats = createAsyncThunk('auth/stats', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`${API_URL}/auth/users/stats`);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
});

export const updateOnlineStatus = createAsyncThunk('auth/status', async (status, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`${API_URL}/auth/users/status`, { status });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
});

export const getUserTasks = createAsyncThunk('auth/tasks', async (_, { getState, rejectWithValue }) => {
    try {
        const { user } = getState().auth;
        if (!user || !user._id) {
            return [];
        }
        const { data } = await axios.get(`${API_URL}/auth/users/tasks`);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Erreur lors de la récupération des tâches');
    }
});

export const initiateEmailChange = createAsyncThunk(
    'auth/initiate-email-change',
    async (newEmail, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/email-change`, { newEmail });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Erreur lors de l\'initiation du changement d\'email');
        }
    }
);

export const verifyEmailChange = createAsyncThunk(
    'auth/verify-email-change',
    async (token, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Erreur lors de la vérification de l\'email');
        }
    }
);

export const assignTaskToUser = createAsyncThunk('auth/assign-task', async (taskId, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${API_URL}/auth/users/tasks/${taskId}/assign`, {});
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Erreur lors de l\'assignation de la tâche');
    }
});
export const updateUserTask = createAsyncThunk(
    'auth/users/tasks/update',
    async ({ taskId, updates }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`${API_URL}/auth/users/tasks/${taskId}`, updates);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetState: () => ({
            ...initialState
        }),
        clearError: (state) => {
            state.error = null;
            state.profileUpdate.error = null;
            state.emailChange.error = null;
        },
        resetProfileUpdate: (state) => {
            state.profileUpdate = initialState.profileUpdate;
        },
        resetEmailChange: (state) => {
            state.emailChange = {
                status: 'idle',
                error: null,
                pendingEmail: null
            };
            // Nettoyer aussi le message global pour une réinitialisation complète
            state.message = null;
        },
        setStatusToIdle: (state) => {
            state.status = 'idle';
            
        },
        initState: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.message = null;
            state.isOk = false;
            state.token = null;
            state.userStats = null;
            state.onlineStatus = 'offline';
            state.userTasks = [];
            state.taskLoadingStatus = 'idle';
            state.taskError = null;
        },
        repairState: (state, action) => {
            if (action.payload.target === 'emailChange' && !state.emailChange) {
                state.emailChange = {
                    status: 'idle',
                    error: null,
                    pendingEmail: null
                };
            }
        }
    },
    extraReducers(builder) {
        builder
        .addCase(authenticate.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(authenticate.fulfilled, (state, action) => {
            const { data: { user, accessToken } } = action.payload;
            localStorage.setItem('token', accessToken);
            state.status = 'success';
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;
            state.message = null;
        })
        .addCase(authenticate.rejected, (state, action) => {
            state.status = 'failed';
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.message = action.error.message || 'Email ou mot de passe invalide';
        })
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.userStats = null;
            state.onlineStatus = 'offline';
            state.userTasks = [];
            state.taskLoadingStatus = 'idle';
            state.taskError = null;
            state.message = null;
        })
        .addCase(register.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(register.fulfilled, (state, action) => {
            state.status = 'success';
            state.message = action.payload.message;
        })
        .addCase(register.rejected, (state, action) => {
            state.status = 'failed';
            state.message = action.error.message;
        })
        .addCase(activation.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
        .addCase(activation.fulfilled, (state, action) => {
            state.status = 'success';
            state.isActive = true;
            state.message = action.payload.message;
            state.error = null;
        })
        .addCase(activation.rejected, (state, action) => {
            state.status = 'failed';
            state.isActive = false;
            state.error = action.payload?.message || 'Erreur lors de l\'activation';
        })
        .addCase(getProfile.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(getProfile.fulfilled, (state, action) => {
            state.status = 'success';
            // Gérer les deux structures possibles de réponse
            const userData = action.payload.data || action.payload;
            state.user = {
                ...state.user,
                ...(userData.user || userData), // Gérer le cas où les données sont dans .user
                updatedAt: new Date().toISOString()
            };
            state.message = action.payload.message || null;
        })
        .addCase(getProfile.rejected, (state, action) => {
            console.error('getProfile.rejected:', {
                payload: action.payload,
                error: action.error
            });
            state.status = 'failed';
            state.message = action.payload?.message || action.payload || 'Erreur lors de la récupération du profil';
            state.user = null;
            state.error = {
                code: action.payload?.code || 500,
                message: state.message
            };
        })
        .addCase(updateProfile.pending, (state) => {
            state.profileUpdate.status = 'loading';
            state.profileUpdate.error = null;
            // Ne pas vider state.user ici
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.profileUpdate.status = 'succeeded';
            // Uniformiser la structure avec getProfile
            const userData = action.payload.user || action.payload;
            state.user = {
                ...state.user,
                ...userData,
                updatedAt: new Date().toISOString()
            };
            state.profileUpdate.error = null;
        })
        .addCase(updateProfile.rejected, (state, action) => {
            state.profileUpdate.status = 'failed';
            state.profileUpdate.error = action.payload?.message || 'Erreur lors de la mise à jour du profil';
        })
        .addCase(updateAvatar.pending, (state) => {
            state.status = 'loading';
            state.error = null;
            state.message = null;
        })
        .addCase(updateAvatar.fulfilled, (state, action) => {
            console.log('updateAvatar.fulfilled - payload:', action.payload);
            
            if (!action.payload.success) {
                state.status = 'failed';
                state.error = {
                    message: action.payload.message || 'Échec de la mise à jour de l\'avatar'
                };
                return;
            }
            
            state.status = 'success';
            // Mise à jour profonde des données utilisateur
            state.user = {
                ...state.user,
                avatar: action.payload.avatar,
                updatedAt: action.payload.updatedAt || state.user.updatedAt
            };
            
            if (action.payload.user) {
                state.user = {
                    ...state.user,
                    ...action.payload.user
                };
            }
            
            state.message = 'Photo de profil mise à jour avec succès';
            state.error = null;

            console.log('updateAvatar.fulfilled - nouvel état:', {
                user: state.user
            });
            
            console.log('État mis à jour:', {
                status: state.status,
                avatar: state.user.avatar,
                message: state.message
            });
        })
        .addCase(updateAvatar.rejected, (state, action) => {
            console.error('updateAvatar.rejected:', action.payload);
            state.status = 'failed';
            state.error = {
                message: action.payload?.message || 'Erreur lors de la mise à jour de la photo de profil'
            };
            state.message = null;
        })
        .addCase(getUserStats.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(getUserStats.fulfilled, (state, action) => {
            console.log('getUserStats.fulfilled - payload:', action.payload);
            state.status = 'success';
            state.userStats = action.payload;
            
            // Mise à jour des informations de l'utilisateur si présentes
            if (action.payload.user) {
                state.user = {
                    ...state.user,
                    ...action.payload.user
                };
            }
            
            state.message = null;
            console.log('État mis à jour:', {
                userStats: state.userStats,
                user: state.user
            });
            console.groupEnd();
        })
        .addCase(getUserStats.rejected, (state, action) => {
            state.status = 'failed';
            state.userStats = null;
            state.message = action.payload;
        })
        .addCase(updateOnlineStatus.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(updateOnlineStatus.fulfilled, (state, action) => {
            state.status = 'success';
            state.onlineStatus = action.payload.status;
            state.message = null;
        })
        .addCase(updateOnlineStatus.rejected, (state, action) => {
            state.status = 'failed';
            state.message = action.payload;
        })
        .addCase(getUserTasks.pending, (state) => {
            state.taskLoadingStatus = 'loading';
            state.taskError = null;
        })
        .addCase(getUserTasks.fulfilled, (state, action) => {
            state.taskLoadingStatus = 'success';
            state.userTasks = action.payload;
            state.taskError = null;
        })
        .addCase(getUserTasks.rejected, (state, action) => {
            state.taskLoadingStatus = 'failed';
            state.taskError = action.payload;
        })
        .addCase(assignTaskToUser.pending, (state) => {
            state.taskLoadingStatus = 'loading';
            state.taskError = null;
        })
        .addCase(assignTaskToUser.fulfilled, (state, action) => {
            state.taskLoadingStatus = 'success';
            state.userTasks.push(action.payload);
            state.taskError = null;
        })
        .addCase(assignTaskToUser.rejected, (state, action) => {
            state.taskLoadingStatus = 'failed';
            state.taskError = action.payload;
        })
        .addCase(updateUserTask.pending, (state) => {
            state.taskLoadingStatus = 'loading';
            state.taskError = null;
        })
        .addCase(updateUserTask.fulfilled, (state, action) => {
            state.taskLoadingStatus = 'success';
            // Met à jour la tâche dans le tableau
            const index = state.userTasks.findIndex(task => task._id === action.payload._id);
            if (index !== -1) {
                state.userTasks[index] = action.payload;
            }
            state.taskError = null;
        })
        .addCase(updateUserTask.rejected, (state, action) => {
            state.taskLoadingStatus = 'failed';
            state.taskError = action.payload;
        })
        // Actions de changement d'email
        .addCase(initiateEmailChange.pending, (state) => {
            state.emailChange.status = 'pending';
            state.emailChange.error = null;
        })
        .addCase(initiateEmailChange.fulfilled, (state, action) => {
            if (!action.payload?.newEmail) {
                // Si pas de nouvelle adresse email, considérer comme une erreur
                state.emailChange.status = 'failed';
                state.emailChange.error = 'Email invalide';
                state.emailChange.pendingEmail = null;
                return;
            }
            
            state.emailChange.status = 'pending';
            state.emailChange.pendingEmail = action.payload.newEmail;
            state.emailChange.error = null;
            state.message = 'Un email de vérification a été envoyé à votre nouvelle adresse';
        })
        .addCase(initiateEmailChange.rejected, (state, action) => {
            state.emailChange.status = 'failed';
            state.emailChange.error = action.payload || 'Erreur lors de l\'envoi de l\'email de vérification';
            state.emailChange.pendingEmail = null;
            // Réinitialiser complètement l'état en cas d'erreur
            state.message = null;
        })
        .addCase(verifyEmailChange.pending, (state) => {
            state.emailChange.status = 'pending';
            state.emailChange.error = null;
        })
        .addCase(verifyEmailChange.fulfilled, (state) => {
            state.emailChange.status = 'verified';
            state.user = {
                ...state.user,
                email: state.emailChange.pendingEmail
            };
            state.emailChange.pendingEmail = null;
            state.emailChange.error = null;
            state.message = 'Votre adresse email a été mise à jour avec succès';
        })
        .addCase(verifyEmailChange.rejected, (state, action) => {
            state.emailChange.status = 'failed';
            state.emailChange.error = action.error.message;
        });
    }
});

/**
 * Sélecteurs pour le state d'authentification
 */
// Selectors pour le changement d'email
export const selectEmailChangeStatus = (state) => (state?.auth?.emailChange) ? state.auth.emailChange.status : 'idle';
export const selectEmailChangeError = (state) => (state?.auth?.emailChange) ? state.auth.emailChange.error : null;
export const selectPendingEmail = (state) => (state?.auth?.emailChange) ? state.auth.emailChange.pendingEmail : null;
export const selectProfileUpdateStatus = (state) => state.auth.profileUpdate?.status || 'idle';
export const selectProfileUpdateError = (state) => state.auth.profileUpdate?.error;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectAuthState = (state) => state.auth;
export const selectUserStats = (state) => state.auth.userStats;
export const selectOnlineStatus = (state) => state.auth.onlineStatus;
export const selectUserTasks = (state) => state.auth.userTasks;
export const selectTaskLoadingStatus = (state) => state.auth.taskLoadingStatus;
export const selectTaskError = (state) => state.auth.taskError;
export const getState = (state) => state.auth; // Maintenu pour rétrocompatibilité

export const { setStatusToIdle, initState, resetProfileUpdate, resetEmailChange, clearError, resetState } = authSlice.actions;
export default authSlice.reducer;
