const {UserRepo, TaskRepo} = require('../db/repository');
const mongoose = require('mongoose');

// Méthodes existantes
const postUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await UserRepo.createUser(userData);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params._id;
        const userData = req.body;
        const updatedUser = await UserRepo.updateUser(userId, userData);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const findOneUser = async (req, res) => {
    try {
        const userId = req.params._id;
        const user = await UserRepo.findOneUser({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params._id;
        const result = await UserRepo.deleteUser(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Nouvelles méthodes pour le profil utilisateur
const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('getProfile - userId:', userId);
        
        const user = await UserRepo.findOneUser({ _id: userId });
        console.log('getProfile - user trouvé:', user ? 'oui' : 'non');
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'Utilisateur non trouvé',
                data: null
            });
        }

        // Construction de l'objet profil avec toutes les informations nécessaires
        const profileData = {
            _id: user._id,
            username: user.username || '',
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            avatar: user.avatar || '/images/defaultProfile.svg',
            dateOfBirth: user.dateOfBirth,
            gender: user.gender || 'non_specifie',
            profession: user.profession || '',
            description: user.description || '',
            location: user.location || { city: '', country: '' },
            onlineStatus: user.onlineStatus || 'hors_ligne',
            lastActivity: user.lastActivity,
            stats: user.stats || {
                tasksCreated: 0,
                tasksCompleted: 0,
                tasksDeleted: 0
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('getProfile - données formatées:', profileData);

        res.status(200).json({
            status: 200,
            message: 'Profil récupéré avec succès',
            data: profileData
        });
    } catch (error) {
        console.error('getProfile - erreur:', error);
        res.status(500).json({
            status: 500,
            message: 'Erreur lors de la récupération du profil',
            data: null
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        console.log('Début de updateProfile');
        console.log('Données reçues du client :', req.body);
        
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
        }

        // Ne prendre que les champs autorisés et présents
        const allowedFields = [
            'username', 'firstName', 'lastName', 'dateOfBirth',
            'gender', 'profession', 'description', 'location'
        ];
        
        const profileData = {
            updatedAt: new Date()
        };
        
        console.log('updateProfile - validation des champs');
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'location' && typeof req.body.location === 'object') {
                    profileData.location = {
                        city: req.body.location.city,
                        country: req.body.location.country
                    };
                } else {
                    profileData[field] = req.body[field];
                }
            }
        });

        console.log('Données filtrées à mettre à jour:', profileData);

        // Vérification de l'existence de l'utilisateur avant la mise à jour
        const existingUser = await UserRepo.findOneUser({ _id: userId });
        if (!existingUser) {
            console.error('updateProfile - utilisateur non trouvé');
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        console.log('updateProfile - mise à jour avec données:', profileData);
        const updatedUser = await UserRepo.updateUser(userId, profileData);
        console.log('Mise à jour réussie:', updatedUser);

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Erreur dans updateProfile:', error);
        
        // Gérer les différents types d'erreurs
        if (error.message.includes('validation failed')) {
            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                details: error.message
            });
        }
        
        if (error.message.includes('non trouvé')) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil',
            error: error.message
        });
    }
}

const updateAvatar = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: 'Image de profil requise' });
        }

        // Créer un chemin relatif pour l'avatar
        const avatarUrl = `/uploads/profiles/${req.file.filename}`;

        // Mise à jour de l'avatar
        const result = await UserRepo.updateUser(userId, { avatar: avatarUrl });

        if (!result) {
            throw new Error('Erreur lors de la mise à jour de l\'avatar');
        }

        res.status(200).json({
            success: true,
            avatar: avatarUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'avatar',
            error: error.message
        });
    }
}

const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('findOneUser - recherche userId:', userId);
        const user = await UserRepo.findOneUser({ _id: userId });
        console.log('findOneUser - résultat:', user ? 'trouvé' : 'non trouvé');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json(user.stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateOnlineStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!req.body.status || !['en_ligne', 'absent', 'ne_pas_deranger', 'hors_ligne'].includes(req.body.status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const updatedUser = await UserRepo.updateUser(userId, {
            onlineStatus: req.body.status,
            lastActivity: new Date()
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const tasks = await TaskRepo.findUserTasks(userId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const assignTaskToUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskId = req.params.taskId;
        
        // Vérifier si la tâche existe
        const task = await TaskRepo.findOneTask(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        // Assigner la tâche à l'utilisateur
        task.assignedTo = userId;
        const updatedTask = await TaskRepo.updateTask(taskId, task);
        
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    postUser,
    updateUser,
    findOneUser,
    deleteUser,
    getProfile,
    updateProfile,
    updateAvatar,
    getUserStats,
    updateOnlineStatus,
    getUserTasks,
    assignTaskToUser
};