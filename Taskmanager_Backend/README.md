# Taskmanager Backend

Application de gestion de tâches avec authentification et notifications par email.

## Installation

### Prérequis

- Node.js
- MongoDB
- Un compte Mailjet pour l'envoi d'emails

### Étapes d'installation

1. Cloner le projet
```bash
git clone [url-du-repo]
cd taskmanager_backend
```

2. Installer les dépendances
```bash
pnpm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Base de données
DB_URL=mongodb://localhost:27017/taskmandb

# Configuration du serveur
URL_PROTOCOL=http
CLIENT_URL=http://localhost:5173
ACTIVATION_PATH=/security/activation

# Sécurité
BCRYPT_SALT=10
JWT_SECRET=votre_secret_jwt
TOKEN_EXPIRES_IN='7200s'

# Configuration Mailjet
MJ_APIKEY_PUBLIC=votre_cle_publique_mailjet
MJ_APIKEY_PRIVATE=votre_cle_privee_mailjet
MJ_SENDER_EMAIL=votre_email@domaine.com
MJ_SENDER_NAME=Taskman.app
```

4. Démarrer le serveur en mode développement
```bash
pnpm start
```
## Routes API

### Routes d'authentification (/api/v1/auth)
- POST /login - Connexion utilisateur
- POST /register - Inscription d'un nouvel utilisateur
- POST /activation - Activation du compte utilisateur
- POST /logout - Déconnexion de l'utilisateur
- GET /users/profile - Récupération du profil utilisateur
- PUT /users/update-profile - Mise à jour du profil utilisateur
- GET /users/stats - Statistiques de l'utilisateur

### Routes utilisateur (/api/v1/users)
- GET /owner/:id - Récupération des tâches d'un utilisateur
- GET /findone/:id - Récupération des détails d'un utilisateur
- PUT /update-avatar - Mise à jour de l'avatar utilisateur

### Routes des tâches (/api/v1/tasks)
- GET / - Liste des tâches
- POST /create - Création d'une nouvelle tâche
- PUT /update/:id - Mise à jour d'une tâche existante
- DELETE /delete/:id - Suppression d'une tâche

## Déploiement sur Render

1. Créer un compte sur Render.com

2. Créer une nouvelle "Web Service"

3. Connecter votre dépôt GitHub

4. Configuration :
   - Build Command : `pnpm install`
   - Start Command : `pnpm start`

5. Variables d'environnement à configurer sur Render :
   - Remplacer `DB_URL` par l'URL de votre cluster MongoDB Atlas
   - Mettre à jour `CLIENT_URL` avec l'URL de votre frontend
   - Configurer les clés Mailjet
   - Définir les autres variables d'environnement comme dans le fichier `.env`

6. Cliquer sur "Create Web Service"

### MongoDB Atlas pour la production

1. Créer un compte sur MongoDB Atlas
2. Créer un nouveau cluster
3. Configurer les utilisateurs et les règles de connexion
4. Obtenir l'URL de connexion et la mettre dans les variables d'environnement de Render

L'application sera automatiquement déployée à chaque push sur la branche principale.