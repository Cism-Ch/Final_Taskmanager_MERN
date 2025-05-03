const { User } = require('../model');
const mongoose = require('mongoose');

const createUser = async (data) => {
    console.log("data: ", data)
    try {
        const instance = new User(data);
        const user = await instance.save();
        console.log("user: ", user)
        return user;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

const updateUser = async (userId, userData) => {
    console.log('updateUser - début mise à jour:', { userId, userData });
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('ID utilisateur invalide');
        }

        console.log('updateUser - userId:', userId);
        console.log('updateUser - userData:', userData);
        
        // Validation et conversion de l'ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('updateUser - ID invalide:', userId);
            throw new Error('ID utilisateur invalide');
        }

        // Construction des données filtrées
        const allowedFields = ['username', 'email', 'firstName', 'lastName', 'avatar',
            'dateOfBirth', 'gender', 'profession', 'description', 'location', 'onlineStatus'];
        
        console.log('updateUser - filtrage des champs');
        const filteredData = Object.entries(userData).reduce((acc, [key, value]) => {
            if (!allowedFields.includes(key)) {
                console.log('updateUser - champ ignoré:', key);
                return acc;
            }
            // Pour les objets imbriqués comme location
            if (value && typeof value === 'object') {
                const filteredNested = Object.entries(value).reduce((nestAcc, [nestedKey, nestedValue]) => {
                    if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
                        nestAcc[nestedKey] = nestedValue;
                    }
                    return nestAcc;
                }, {});
                if (Object.keys(filteredNested).length > 0) {
                    acc[key] = filteredNested;
                }
            }
            // Pour les champs simples
            else if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {});

        console.log('updateUser - filteredData:', filteredData);

        // Trouver l'utilisateur d'abord
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        console.log('User found:', user);

        // Appliquer les modifications
        Object.entries(filteredData).forEach(([key, value]) => {
            if (key === 'location') {
                user.location = { ...user.location, ...value };
            } else {
                user[key] = value;
            }
        });

        // Sauvegarder les modifications
        const result = await user.save();
        console.log('User updated:', result);

        if (!result) {
            throw new Error('Utilisateur non trouvé');
        }

        console.log('updateUser - result:', result);
        return result;
    } catch (error) {
        console.error('Error in updateUser:', error);
        throw new Error('Error updating user: ' + error.message);
    }
}

const findOneUser = async (query) => {
    try {
        const result = await User.findOne(query);
        return result;
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
}

const getUsers = async (ownerId) => {
    try {
        const users = await User.find({ owner: ownerId });
        return users;
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
}

const deleteUser = async (userId) => {
    try {
        const result = await User.findByIdAndDelete(userId);
        return result;
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
}

module.exports = {
    createUser,
    updateUser,
    findOneUser,
    getUsers,
    deleteUser,
};