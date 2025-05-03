const authRouter = require('express').Router();
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');
const AuthCtrl = require('../controllers/auth.ctrl');

// Routes publiques
authRouter.post('/login', AuthCtrl.login);
authRouter.post('/register', AuthCtrl.register);
authRouter.post('/activation', AuthCtrl.activation);
authRouter.post('/logout', AuthCtrl.logout);

// Routes protégées
authRouter.get('/users/profile', authenticate, AuthCtrl.getProfile);
authRouter.put('/users/update-profile', authenticate, AuthCtrl.updateProfile);
authRouter.put('/users/update-avatar', authenticate, upload.single('avatar'), AuthCtrl.updateAvatar);
authRouter.get('/users/stats', authenticate, AuthCtrl.getUserStats);
authRouter.put('/users/status', authenticate, AuthCtrl.updateStatus);
// Routes pour les tâches de l'utilisateur connecté
authRouter.get('/users/tasks', authenticate, AuthCtrl.getUserTasks);
authRouter.put('/users/tasks/:taskId', authenticate, AuthCtrl.updateUserTask);

// Routes pour la vérification d'email
authRouter.post('/email-change', authenticate, AuthCtrl.initiateEmailChange);
authRouter.get('/verify-email', AuthCtrl.verifyEmailUpdate);

module.exports = authRouter;