# Architecture du Task Manager MERN

## Vue d'ensemble

Task Manager MERN est une application web de gestion de tâches construite avec la stack MERN (MongoDB, Express.js, React, Node.js). L'application permet aux utilisateurs de créer, organiser et suivre leurs tâches avec des fonctionnalités avancées de filtrage, tri et catégorisation.

```ascii
┌─────────────────┐     HTTPS     ┌──────────────┐    REST API    ┌─────────────┐
│  Frontend React │ ────────────► │ Backend Node │ ───────────►   │  MongoDB    │
└─────────────────┘               └──────────────┘                └─────────────┘
```

## Stack Technologique

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MongoDB
- **Authentification**: JWT
- **Validation**: Mongoose
- **Emails**: Handlebars pour les templates

### Frontend
- **Framework**: React
- **État global**: Redux Toolkit
- **Persistence**: Redux Persist
- **Styles**: Tailwind CSS
- **Routing**: React Router

## Architecture Backend

### Structure des dossiers
```
Taskmanager_Backend/
├── controllers/       # Logique métier
├── routes/           # Définition des routes API
├── middlewares/      # Middlewares (auth, upload)
├── db/
│   ├── models/       # Schémas Mongoose
│   └── repository/   # Couche d'accès aux données
├── services/         # Services métier
└── utilitaire/       # Utilitaires (tokens, emails)
```

### Modèles de données

#### User
- Authentification (username, email, password)
- Profil (firstName, lastName, avatar)
- Statistiques (tasksCreated, tasksCompleted)
- Gestion email (vérification, réinitialisation)

#### Task
- Informations (title, description, status)
- Catégorisation (category)
- Dates (dueDate, timestamps)
- Relations (owner -> User)

### Points d'API principaux

```ascii
POST   /api/auth/register    # Inscription
POST   /api/auth/login       # Connexion
GET    /api/tasks/owner/:id  # Tâches de l'utilisateur
POST   /api/tasks/create     # Création de tâche
PUT    /api/tasks/:id        # Modification de tâche
DELETE /api/tasks/:id        # Suppression de tâche
```

### Sécurité
- Authentification par JWT
- Middleware d'authentification sur routes protégées
- Hashage des mots de passe
- Validation des données avec Mongoose
- Vérification email en deux étapes

## Architecture Frontend

### Structure des dossiers
```
Taskmanager_Frontend/
├── src/
│   ├── components/     # Composants React
│   ├── pages/         # Pages/Routes
│   ├── redux/         # Store et slices Redux
│   ├── hooks/         # Hooks personnalisés
│   └── utils/         # Utilitaires
```

### État Redux
```
store/
├── auth/          # État authentification
├── tasks/         # État des tâches
└── categories/    # État des catégories
```

### Composants principaux
- Layout (Header, Sidebar, Footer)
- TodoList et TodoListItem
- Filtres (TodoFilter)
- Formulaires (login, register)
- Profile

## Flux de données

### Création de tâche
```ascii
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
│ TodoForm │ -> │ taskSlice │ -> │ API Call │ -> │ MongoDB │
└──────────┘    └───────────┘    └──────────┘    └─────────┘
```

### Authentification
```ascii
┌────────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
│ LoginForm  │ -> │ authSlice │ -> │ API Call │ -> │ MongoDB │
└────────────┘    └───────────┘    └──────────┘    └─────────┘
     ↓                 ↓
┌────────────┐    ┌───────┐
│ JWT Token  │ -> │ Store │
└────────────┘    └───────┘
```

## Optimisations

### Backend
- Indexation MongoDB pour les requêtes fréquentes
- Middleware de validation
- Gestion des erreurs centralisée
- Rate limiting

### Frontend
- Redux persist pour la persistance locale
- Lazy loading des composants
- Optimisations des re-renders
- Gestion du state avec Redux Toolkit

