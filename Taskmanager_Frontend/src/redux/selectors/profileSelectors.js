/**
 * Sélecteurs pour le profil utilisateur
 */

import { createSelector } from '@reduxjs/toolkit';

// Sélectionne le profil utilisateur complet
export const selectUserProfile = (state) => {
    const user = state.auth.user;
    console.log('State dans selectUserProfile:', user);
    // Gérer toutes les structures possibles
    if (!user) return null;
    return user.data || user.user || user;
};

// Sélectionne l'avatar de l'utilisateur avec fallback
export const selectUserAvatar = (state) => {
    const userData = state.auth.user;
    console.log('Avatar dans selectUserAvatar:', userData?.avatar);
    return userData?.avatar || '/images/defaultProfile.svg';
};

// Sélectionne des champs spécifiques du profil
// Sélecteur mémoïsé pour les informations complètes du profil
export const selectUserInfo = createSelector(
    [selectUserProfile],
    (profile) => {
        if (!profile) return null;
        console.log('selectUserInfo - données brutes:', profile);
        
        // S'assurer que toutes les propriétés sont définies
        return {
            username: profile?.username ?? profile?.email?.split('@')[0] ?? '',
            email: profile?.email ?? '',
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            profession: profile?.profession ?? '',
            gender: profile?.gender ?? 'non_specifie',
            description: profile?.description ?? '',
            location: profile?.location ?? { city: '', country: '' },
            createdAt: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
            updatedAt: profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '',
            onlineStatus: profile?.onlineStatus ?? 'hors_ligne',
            stats: profile?.stats ?? {
                tasksCreated: 0,
                tasksCompleted: 0,
                tasksDeleted: 0
            }
        };
    }
);

// Sélecteur pour les statistiques
export const selectUserStats = createSelector(
    [selectUserProfile],
    (profile) => profile?.stats || {
        tasksCreated: 0,
        tasksCompleted: 0,
        tasksDeleted: 0
    }
);

// Sélectionne le statut de chargement
export const selectProfileLoadingStatus = (state) => state.auth.status;

// Sélectionne le message d'erreur ou de succès
export const selectProfileMessage = (state) => state.auth.message;

// Vérifie si une action est en cours
export const selectIsProfileUpdating = (state) => state.auth.status === 'loading';

// Sélecteur mémoïsé pour les statistiques des tâches
export const selectTaskStats = createSelector(
    [(state) => state.tasks.tasks],
    (tasks) => {
        console.log('Calcul des stats - tasks:', tasks);
        return {
            total: tasks.length,
            pending: tasks.filter(task => task.status === "pending").length,
            deleted: tasks.filter(task => task.status === "deleted" || task.isDeleted).length,
            completed: tasks.filter(task => task.status === "done").length,
            important: tasks.filter(task => task.priority === "high").length
        };
    }
);

// Sélecteur mémoïsé pour les activités récentes
export const selectRecentActivities = createSelector(
    [(state) => state.tasks.tasks],
    (tasks) => {
        // Créer un tableau d'activités à partir des tâches
        const activities = tasks.map(task => ({
            type: task.status === "done" ? "complete" : 
                  task.status === "deleted" ? "delete" : 
                  task.updatedAt !== task.createdAt ? "update" : "create",
            title: task.title,
            date: task.updatedAt || task.createdAt,
            status: task.status === "done" ? "completed" : 
                   task.status === "deleted" ? "deleted" : "pending"
        }));

        // Trier par date décroissante et limiter à 5 éléments
        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    }
);