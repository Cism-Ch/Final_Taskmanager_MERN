const taskRouter = require('express').Router();
const taskCtrl = require('../controllers/task.ctrl');
const authenticate = require('../middlewares/authenticate');

// Middleware d'authentification pour toutes les routes
taskRouter.use(authenticate);

// Routes de base CRUD
taskRouter.post('/create', taskCtrl.postTask); // Créer une nouvelle tâche
taskRouter.put('/update/:id', taskCtrl.updateTask); // Mettre à jour une tâche par ID
taskRouter.delete('/delete/:id', taskCtrl.deleteTask); // Supprimer une tâche par ID
taskRouter.post('/delete-many', taskCtrl.deleteManyTasks); // Supprimer plusieurs tâches

// Routes de récupération des tâches
taskRouter.get('/owner/:id', taskCtrl.getOwnerTasks); // Obtenir les tâches d'un propriétaire (avec filtres optionnels status et category)
taskRouter.get('/owner/:id/category/:category', taskCtrl.getTasksByCategory); // Obtenir les tâches par catégorie
taskRouter.get('/owner/:id/status/:status', taskCtrl.getTasksByStatus); // Obtenir les tâches par status
taskRouter.get('/owner/:id/due-date', taskCtrl.getTasksByDueDate); // Obtenir les tâches par date d'échéance (avec paramètres startDate et endDate)

// Nouvelle route pour la gestion des tâches importantes
taskRouter.put('/:id/important', taskCtrl.toggleTaskImportance); // Basculer l'importance d'une tâche
// Routes de filtrage et tri
taskRouter.put('/:id/category', taskCtrl.updateCategory); // Mettre à jour la catégorie d'une tâche
taskRouter.put('/:id/status', taskCtrl.updateStatus); // Mettre à jour le statut d'une tâche
taskRouter.put('/:id/due-date', taskCtrl.updateDueDate); // Mettre à jour la date d'échéance d'une tâche

// Route pour les tâches importantes
taskRouter.get('/owner/:id/important', taskCtrl.getImportantTasks); // Obtenir les tâches importantes
// Routes de tri
taskRouter.get('/owner/:id/sort/title/:order', taskCtrl.getTasksSortedByTitle); // Tri par titre
taskRouter.get('/owner/:id/sort/date/:order', taskCtrl.getTasksSortedByDate); // Tri par date de création

module.exports = taskRouter;