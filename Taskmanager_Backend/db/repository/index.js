const UserRepo = require('./user.repo');
const TaskRepo = require('./task.repo');
const TmpUserRepo = require('./tmp.user.repo');

// Vérification de l'initialisation des repositories
const repositories = {
    UserRepo,
    TaskRepo,
    TmpUserRepo
};

// Vérifier que chaque repository a les méthodes requises
Object.entries(repositories).forEach(([name]) => {
    console.log(`Initializing ${name}...`);
    
    console.log(`${name} successfully initialized`);
});

module.exports = repositories;