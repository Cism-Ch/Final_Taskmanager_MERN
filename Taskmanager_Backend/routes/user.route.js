const userRouter = require('express').Router();
const userCtrl = require('../controllers/user.ctrl');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

// Routes spécifiques aux utilisateurs
userRouter.get('/profile', authenticate, userCtrl.getProfile);
userRouter.get('/findone/:id', authenticate, userCtrl.findOneUser);

// Route de mise à jour du profil
userRouter.put('/update-profile', authenticate, userCtrl.updateProfile);

// Route de gestion du statut en ligne
// userRouter.put('/status', authenticate, userCtrl.updateUserStatus);

// Routes de gestion des tâches utilisateur
userRouter.get('/tasks', authenticate, userCtrl.getUserTasks);
userRouter.post('/tasks/:taskId/assign', authenticate, userCtrl.assignTaskToUser);

// Route de mise à jour de l'avatar (spécifique à user.route.js)
userRouter.put('/update-avatar', authenticate, upload.single('avatar'), userCtrl.updateAvatar);

module.exports = userRouter;