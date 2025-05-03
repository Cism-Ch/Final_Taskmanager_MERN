const mongoose = require('mongoose');

// Importer les modèles
const User = require('./user.model');
const Task = require('./task.model');
const TmpUser = require('./tmp.user');

// Vérifier que les modèles sont correctement initialisés
const models = {
    User,
    Task,
    TmpUser
};

// Vérifier que chaque modèle est bien un modèle Mongoose
Object.entries(models).forEach(([name, model]) => {
    if (!(model.prototype instanceof mongoose.Model)) {
        console.error(`Erreur: ${name} n'est pas un modèle Mongoose valide`);
        throw new Error(`${name} n'est pas un modèle Mongoose valide`);
    }
    console.log(`Modèle ${name} correctement initialisé`);
});

module.exports = models;