const { TmpUser } = require('../model');
const mongoose = require('mongoose');

/**
 * Crée un nouvel utilisateur temporaire
 * @param {Object} userData - Les données de l'utilisateur temporaire
 * @returns {Promise<Object>} L'utilisateur temporaire créé
 */
const createTmpUser = async (userData) => {
    try {
        if (!userData || typeof userData !== 'object') {
            throw new Error('Les données utilisateur sont requises et doivent être un objet');
        }

        console.log('Tentative de création d\'un utilisateur temporaire:', { 
            email: userData.email,
            timestamp: new Date().toISOString() 
        });

        const tmpUser = new TmpUser(userData);
        const savedUser = await tmpUser.save();

        console.log('Utilisateur temporaire créé avec succès:', {
            userId: savedUser._id,
            email: savedUser.email,
            timestamp: new Date().toISOString()
        });

        return savedUser;
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur temporaire:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};

/**
 * Recherche un utilisateur temporaire par son ID
 * @param {string} userId - L'ID de l'utilisateur temporaire
 * @returns {Promise<Object>} L'utilisateur temporaire trouvé
 */
const findTmpUser = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID utilisateur invalide');
        }

        console.log('Recherche de l\'utilisateur temporaire:', {
            userId,
            timestamp: new Date().toISOString()
        });

        const user = await TmpUser.findById(userId);
        
        if (!user) {
            console.log('Aucun utilisateur temporaire trouvé:', {
                userId,
                timestamp: new Date().toISOString()
            });
            return null;
        }

        console.log('Utilisateur temporaire trouvé:', {
            userId: user._id,
            timestamp: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur temporaire:', {
            error: error.message,
            userId,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};

/**
 * Supprime un utilisateur temporaire par son ID
 * @param {string} userId - L'ID de l'utilisateur temporaire
 * @returns {Promise<Object>} L'utilisateur temporaire supprimé
 */
const deleteTmpUser = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID utilisateur invalide');
        }

        console.log('Tentative de suppression de l\'utilisateur temporaire:', {
            userId,
            timestamp: new Date().toISOString()
        });

        const deletedUser = await TmpUser.findByIdAndDelete(userId);

        if (!deletedUser) {
            console.log('Aucun utilisateur temporaire trouvé pour la suppression:', {
                userId,
                timestamp: new Date().toISOString()
            });
            return null;
        }

        console.log('Utilisateur temporaire supprimé avec succès:', {
            userId: deletedUser._id,
            timestamp: new Date().toISOString()
        });

        return deletedUser;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur temporaire:', {
            error: error.message,
            userId,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};

/**
 * Recherche un utilisateur temporaire par son token
 * @param {string} token - Le token de l'utilisateur temporaire
 * @returns {Promise<Object>} L'utilisateur temporaire trouvé
 */
const findTmpUserByToken = async (token) => {
    try {
        if (!token || typeof token !== 'string') {
            throw new Error('Token invalide');
        }

        console.log('Recherche de l\'utilisateur temporaire par token:', {
            token: token.substring(0, 8) + '...',
            timestamp: new Date().toISOString()
        });

        const user = await TmpUser.findOne({ token });

        if (!user) {
            console.log('Aucun utilisateur temporaire trouvé pour ce token:', {
                token: token.substring(0, 8) + '...',
                timestamp: new Date().toISOString()
            });
            return null;
        }

        console.log('Utilisateur temporaire trouvé par token:', {
            userId: user._id,
            token: token.substring(0, 8) + '...',
            timestamp: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur temporaire par token:', {
            error: error.message,
            token: token?.substring(0, 8) + '...',
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};
/**
 * Recherche un utilisateur temporaire par son email
 * @param {string} email - L'email de l'utilisateur temporaire
 * @returns {Promise<Object>} L'utilisateur temporaire trouvé
 */
const findTmpUserByEmail = async (email) => {
    try {
        if (!email || typeof email !== 'string') {
            throw new Error('Email invalide');
        }

        console.log('Recherche de l\'utilisateur temporaire par email:', {
            email,
            timestamp: new Date().toISOString()
        });

        const user = await TmpUser.findOne({ email });
        
        console.log('Résultat de la recherche:', {
            found: !!user,
            email,
            timestamp: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error('Erreur lors de la recherche par email:', error);
        throw error;
    }
};

module.exports = {
    createTmpUser,
    findTmpUser,
    findTmpUserByEmail,
    deleteTmpUser,
    findTmpUserByToken
};