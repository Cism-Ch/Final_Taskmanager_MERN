# Documentation Technique Backend TaskManager

## Table des matières
- [Architecture et Configuration](#architecture-et-configuration)
- [API Endpoints](#api-endpoints)
- [Modèles de Données](#modèles-de-données)
- [Middleware et Sécurité](#middleware-et-sécurité)
- [Service d'Emails](#service-demails)
- [Bonnes Pratiques](#bonnes-pratiques)

## Architecture et Configuration

### Structure du Projet
```
Taskmanager_Backend/
├── app.js              # Point d'entrée de l'application
├── routes/            # Définition des routes API
├── controllers/       # Logique métier
├── db/               # Configuration et modèles de base de données
├── middlewares/      # Middlewares personnalisés
└── utilitaire/       # Utilitaires (emails, tokens, etc.)
```

### Configuration Principale
Le serveur utilise Express.js avec les configurations suivantes :
- CORS configuré pour le domaine client spécifié
- Parser JSON et URL-encoded
- Gestion des fichiers statiques
- Logging détaillé des requêtes
- Gestion globale des erreurs

### Sécurité
- Authentification via JWT
- Validation des données entrantes
- Protection CORS
- Gestion sécurisée des fichiers uploadés

## API Endpoints

### Authentication (/auth)
| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|-----------------|
| POST | /login | Connexion utilisateur | Non |
| POST | /register | Inscription utilisateur | Non |
| POST | /activation | Activation du compte | Non |
| POST | /logout | Déconnexion | Non |
| GET | /users/profile | Obtenir le profil | Oui |
| PUT | /users/update-profile | Mettre à jour le profil | Oui |
| PUT | /users/update-avatar | Mettre à jour l'avatar | Oui |
| GET | /users/stats | Obtenir les statistiques utilisateur | Oui |
| PUT | /users/status | Mettre à jour le statut utilisateur | Oui |
| GET | /users/tasks | Obtenir les tâches de l'utilisateur | Oui |
| PUT | /users/tasks/:taskId | Mettre à jour une tâche utilisateur | Oui |
| POST | /email-change | Initier le changement d'email | Oui |
| GET | /verify-email | Vérifier la mise à jour d'email | Non |

### Tâches (/tasks)
| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|-----------------|
| POST | /create | Créer une tâche | Oui |
| PUT | /update/:id | Modifier une tâche | Oui |
| DELETE | /delete/:id | Supprimer une tâche | Oui |
| GET | /owner/:id | Liste des tâches | Oui |
| PUT | /:id/important | Basculer importance | Oui |
| GET | /owner/:id/category/:category | Filtrer par catégorie | Oui |

## Modèles de Données

### Utilisateur Temporaire (TmpUser)
```javascript
{
  name: String,           // Requis
  email: String,         // Requis, unique
  password: String,      // Requis, hashé
  active: Boolean,       // État d'activation
  token: String,        // Token de validation
  createdAt: Date       // Date de création avec expiration (1h)
}
```

### Utilisateur (User)
```javascript
{
  username: String,         // Requis, unique
  email: String,           // Requis, unique
  password: String,        // Requis, hashé
  is_active: Boolean,      // État d'activation
  avatar: String,          // Chemin de l'image
  description: String,     // Bio de l'utilisateur
  stats: {                 // Statistiques
    tasksCreated: Number,
    tasksCompleted: Number,
    tasksDeleted: Number
  }
}
```

### Tâche (Task)
```javascript
{
  title: String,           // Requis
  description: String,     // Optionnel
  status: String,         // 'pending' ou 'done'
  category: String,       // Catégorie de la tâche
  dueDate: Date,         // Date d'échéance
  owner: ObjectId,       // Référence à l'utilisateur
  isImportant: Boolean   // Marqueur d'importance
}
```

## Middlewares et Sécurité

### Middleware d'Authentification
Le middleware `authenticate.js` assure :
- La validation des tokens JWT
- La vérification de l'expiration des tokens
- L'injection des données utilisateur dans la requête
- La gestion des erreurs d'authentification

### Middleware d'Upload
Le middleware `upload.js` gère :
- La validation des types de fichiers (images uniquement)
- La limitation de taille (max 5MB)
- La génération de noms de fichiers sécurisés
- Le stockage organisé des fichiers

### Middleware de Validation
Validation des données entrantes avec :
- Vérification des champs requis
- Validation des formats (email, dates, etc.)
- Protection contre les injections

### Middleware de Rate Limiting
Protection contre les abus avec :
- Limitation du nombre de requêtes par IP
- Fenêtres de temps configurables
- Blocage temporaire après trop de tentatives

### authenticate.js
Middleware d'authentification qui :
- Vérifie la présence du token JWT
- Valide le token
- Injecte l'utilisateur dans la requête

### upload.js
Middleware de gestion des uploads qui :
- Filtre les types de fichiers
- Limite la taille des fichiers
- Génère des noms de fichiers sécurisés

## Services et Repositories

### Repositories
Implémentation du pattern Repository pour la séparation des responsabilités :
- `user.repo.js` : Gestion des opérations CRUD utilisateur
- `task.repo.js` : Gestion des opérations CRUD tâches
- `tmp.user.repo.js` : Gestion des utilisateurs temporaires

### Services Métier
- `auth.service.js` : Logique d'authentification et gestion des tokens
- `task.service.js` : Logique de gestion des tâches
- `user.service.js` : Gestion du profil et des statistiques

## Service d'Emails

### Configuration
Utilise Mailjet comme service d'envoi avec :
- Templates Handlebars personnalisables
- Gestion des erreurs robuste
- Files d'attente pour les envois massifs

### Templates Disponibles
- Vérification d'email (emailVerification.handlebars)
- Demande de réinitialisation du mot de passe (requestresetPassword.handlebars)
- Réinitialisation du mot de passe (resetPassword.handlebars)
- Email de bienvenue (welcome.handlebars)

### Exemple d'Utilisation
```javascript
const sendEmail = require('../utilitaire/email/sendEmail');

await sendEmail(
  userEmail,
  "Bienvenue sur TaskManager",
  { username: user.username },
  "template/welcome.handlebars"
);
```

## Bonnes Pratiques

### Sécurité
- Validation des entrées utilisateur
- Hachage des mots de passe avec bcrypt
- Tokens JWT avec expiration
- Protection contre les injections NoSQL
- Limitation de débit sur les routes sensibles
- Validation des emails avec tokens temporaires
- Système d'utilisateurs temporaires pour l'inscription
- Vérification des droits d'accès aux ressources

### Performance
- Indexation MongoDB optimisée
- Mise en cache des fichiers statiques
- Compression des réponses
- Pagination des résultats

### Gestion des Erreurs
- Logging structuré des erreurs
- Réponses d'erreur standardisées
- Validation des données entrantes
- Gestion des cas limites

### Maintenance
- Code modulaire et bien organisé
- Documentation des API avec exemples
- Tests unitaires et d'intégration
- Variables d'environnement pour la configuration