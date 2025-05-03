const service = require('../service/auth.service');
const { UserRepo } = require('../db/repository');
const fs = require('fs').promises;
const path = require('path');

// Constantes pour les chemins d'upload
const UPLOAD_BASE_PATH = path.join(process.cwd(), 'public', 'uploads', 'profiles');
const UPLOAD_URL_PATH = '/uploads/profiles';

const register = async (req, res) => {
    const result = await service.register(req.body)
    res.status(result.status).json({...result})
}

const activation = async (req, res) => {
    try {
        console.log('Activation - Requête reçue:', {
            body: req.body,
            timestamp: new Date().toISOString()
        });

        const { token, id } = req.body;

        // Validation améliorée des données
        if (!token || typeof token !== 'string' || token.trim().length === 0) {
            return res.status(422).json({
                status: 422,
                message: "Token d'activation invalide",
                data: null
            });
        }

        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            return res.status(422).json({
                status: 422,
                message: "ID utilisateur invalide",
                data: null
            });
        }

        const result = await service.Activate({ token: token.trim(), userId: id.trim() });
        console.log('Activation - Résultat:', result);

        res.status(result.status).json({...result});
    } catch (error) {
        console.error('Activation - Erreur:', error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de l'activation du compte",
            error: error.message,
            data: null
        });
    }
}

const login = async (req, res) => {
    console.log('login: ', req.body)
    const result = await service.login(req.body)
    console.log('result: ', result)
    
    // S'assurer qu'une réponse avec un corps est toujours envoyée
    if (!result.data) {
        res.status(401).json({
            status: 401,
            message: result.message || 'Échec de l\'authentification',
            data: null
        })
        return
    }
    
    res.status(result.status).json({...result})
}

const logout = async (req, res) => {
    try {
        // Clear any session data if needed
        res.status(200).json({
            status: 200,
            message: 'Déconnexion réussie'
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la déconnexion',
            error: error.message
        })
    }
}

const getProfile = async (req, res) => {
    try {
        // req.user est défini par le middleware authenticate
        const user = req.user
        res.status(200).json({
            status: 200,
            data: user,
            message: 'Profil récupéré avec succès'
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        // Log pour debug
        console.log('Received update profile request:', {
            body: req.body,
            userId: req.user._id
        });

        // Appel au service
        const result = await service.updateUserStatus(req.user._id, req.body);

        return res.status(200).json({
            success: true,
            user: result.user
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(error.message.includes('non trouvé') ? 404 : 400).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour du profil'
        });
    }
};

const getUserStats = async (req, res) => {
    try {
        const result = await service.getUserStats(req.user._id)
        res.status(result.status).json({...result})
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        })
    }
}

const updateStatus = async (req, res) => {
    try {
        const result = await service.updateUserStatus(req.user._id, req.body.status)
        res.status(result.status).json({...result})
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        })
    }
}

const getUserTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const tasks = await service.getUserTasks(userId);
        
        res.status(200).json({
            status: 200,
            data: tasks,
            message: 'Tâches récupérées avec succès'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération des tâches',
            error: error.message
        });
    }
};

const updateUserTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;
        const updates = req.body;
        
        const updatedTask = await service.updateUserTask(userId, taskId, updates);
        
        res.status(200).json({
            status: 200,
            data: updatedTask,
            message: 'Tâche mise à jour avec succès'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la mise à jour de la tâche',
            error: error.message
        });
    }
};

const updateAvatar = async (req, res) => {
    try {
        console.group('updateAvatar - Controller');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier n\'a été uploadé'
            });
        }

        const avatarUrl = `${UPLOAD_URL_PATH}/${req.file.filename}`;
        
        // Récupérer l'ancien avatar
        const user = await UserRepo.findById({ _id: req.user._id });
        if (user?.avatar && !user.avatar.includes('defaultProfile')) {
            const oldAvatarPath = path.join(UPLOAD_BASE_PATH, path.basename(user.avatar));
            try {
                await fs.access(oldAvatarPath);
                await fs.unlink(oldAvatarPath);
                console.log('Ancien avatar supprimé:', oldAvatarPath);
            } catch (error) {
                console.warn('Ancien avatar non trouvé:', oldAvatarPath);
            }
        }

        // Mise à jour de l'utilisateur avec le nouvel avatar
        const updatedUser = await UserRepo.updateUser(req.user._id, { avatar: avatarUrl });
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        console.log('Avatar mis à jour avec succès:', {
            userId: updatedUser._id,
            avatar: avatarUrl
        });
        console.groupEnd();

        res.status(200).json({
            success: true,
            message: 'Avatar mis à jour avec succès',
            avatar: avatarUrl,
            user: updatedUser
        });
    } catch (error) {
        console.error('updateAvatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'avatar',
            error: error.message
        });
    }
};

// Initier le changement d'email
const initiateEmailChange = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.user._id;

        const result = await service.initiateEmailChange(userId, newEmail);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Erreur lors de l\'initiation du changement d\'email'
        });
    }
};

// Vérifier et finaliser le changement d'email
const verifyEmailUpdate = async (req, res) => {
    try {
        const { token } = req.query;
        const result = await service.verifyEmailUpdate(token);
        
        // Rediriger vers le frontend avec le statut
        const redirectUrl = `${process.env.CLIENT_URL}/profile?emailVerified=${result.success}`;
        res.redirect(redirectUrl);
    } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/profile?error=${encodeURIComponent(error.message)}`);
    }
};

module.exports = {
    register,
    activation,
    login,
    logout,
    getProfile,
    updateProfile,
    updateAvatar,
    getUserStats,
    updateStatus,
    getUserTasks,
    updateUserTask,
    initiateEmailChange,
    verifyEmailUpdate
};
