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

### Patterns de conception implémentés
- **Repository Pattern**: Abstraction de la couche données avec interfaces dédiées
- **Service Layer Pattern**: Séparation de la logique métier
- **Factory Pattern**: Création d'objets complexes (emails, tokens)
- **Strategy Pattern**: Gestion flexible des authentifications
- **Observer Pattern**: Système de notifications et événements
- **Middleware Pattern**: Chaînage des traitements HTTP
- **DTO Pattern**: Transformation et validation des données

### Structure des dossiers et responsabilités
```
Taskmanager_Backend/
├── controllers/       # Logique de routage et validation
│   ├── auth.ctrl.js    # Authentification et autorisation
│   ├── task.ctrl.js    # Gestion des tâches
│   └── user.ctrl.js    # Gestion des utilisateurs
├── routes/           # Définition des routes API
│   ├── auth.route.js   # Routes d'authentification
│   ├── task.route.js   # Routes des tâches
│   └── user.route.js   # Routes utilisateurs
├── middlewares/      # Middlewares applicatifs
│   ├── authenticate.js  # Vérification JWT
│   └── upload.js       # Gestion des uploads
├── db/
│   ├── models/         # Schémas et modèles Mongoose
│   └── repository/     # Couche d'accès aux données
├── services/         # Logique métier pure
└── utilitaire/       # Services techniques
    ├── email/         # Gestion des emails
    └── gen.token.js   # Génération de tokens
```

### Architecture de la base de données

#### Collections et schémas

##### Collection User
```javascript
{
  _id: ObjectId,
  username: String,          // Unique, requis
  email: String,            // Unique, requis
  password: String,         // Hashé avec bcrypt
  firstName: String,
  lastName: String,
  avatar: String,           // URL de l'image
  isVerified: Boolean,      // Vérification email
  resetToken: String,       // Token réinitialisation
  statistics: {
    tasksCreated: Number,
    tasksCompleted: Number,
    lastActive: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

##### Collection Task
```javascript
{
  _id: ObjectId,
  title: String,           // Requis
  description: String,
  status: String,          // enum: ['todo', 'in-progress', 'done']
  category: String,        // Catégorie personnalisable
  priority: String,        // enum: ['low', 'medium', 'high']
  owner: ObjectId,         // Référence -> User
  dueDate: Date,
  completedAt: Date,
  tags: [String],
  history: [{              // Historique des modifications
    action: String,
    timestamp: Date,
    previousState: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Index et optimisations
- Index composites sur `owner` et `status`
- Index texte sur `title` et `description`
- Index sur `dueDate` pour les requêtes temporelles
- Index unique sur `email` et `username`

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
│   ├── components/     # Composants React réutilisables
│   │   ├── TodoFilter/   # Composants de filtrage
│   │   ├── icons/        # Composants d'icônes SVG
│   │   └── profile/      # Composants du profil
│   ├── pages/         # Pages/Routes de l'application
│   ├── redux/         # Store et slices Redux
│   │   ├── slices/      # Reducers et actions
│   │   ├── middleware/  # Middleware personnalisé
│   │   └── selectors/   # Sélecteurs Redux
│   ├── hooks/         # Hooks personnalisés React
│   ├── contexts/      # Contextes React (PopupContext)
│   ├── services/      # Services API et notifications
│   └── utils/         # Utilitaires et helpers
```

### Architecture des composants React
- **Pattern Container/Présentation**: Séparation des composants logiques et de présentation
- **Composants fonctionnels**: Utilisation exclusive de composants fonctionnels avec hooks
- **Composants réutilisables**: Création de composants génériques et modulaires
- **Composition**: Utilisation de la composition plutôt que l'héritage
- **Props Drilling**: Minimisé grâce à l'utilisation de Redux et Context

### Gestion de l'état avec Redux
```
store/
├── auth/          # Authentification et profil utilisateur
│   ├── state: { user, token, isAuthenticated }
│   └── actions: { login, logout, updateProfile }
├── tasks/         # Gestion des tâches
│   ├── state: { tasks, loading, error }
│   └── actions: { create, update, delete, filter }
└── categories/    # Gestion des catégories
    ├── state: { categories, activeCategory }
    └── actions: { setCategory, clearCategory }
```

### Patterns Redux implémentés
- **Slice Pattern**: Organisation du code Redux en slices
- **Middleware Pattern**: Gestion des effets secondaires
- **Selector Pattern**: Accès optimisé aux données du store
- **Action Creator Pattern**: Création d'actions typées
- **Thunk Pattern**: Gestion des actions asynchrones

### Composants principaux et responsabilités
- **Layout**: Structure globale de l'application
  - Header: Navigation et thème
  - Sidebar: Menu latéral et filtres
  - Footer: Informations générales
- **TodoList et TodoListItem**:
  - Gestion CRUD des tâches
  - Filtrage et tri
  - État des tâches (complété, en cours)
- **Système de filtrage**:
  - Filtres principaux (MainFilters)
  - Filtre par date (DateRangeFilter)
  - Filtre par catégorie (CategorySelect)
  - Options de tri (SortingOptions)
- **Formulaires**:
  - Validation côté client
  - Gestion des erreurs
  - Retours utilisateur
- **Profil**:
  - Affichage des statistiques
  - Mise à jour des informations
  - Activité récente

## Flux de données et interactions

### Patterns de flux de données
- **Unidirectional Data Flow**: Flux de données unidirectionnel avec Redux
- **Event Sourcing**: Traçabilité des actions utilisateur
- **Publisher/Subscriber**: Communication entre composants via Redux
- **Command Pattern**: Actions Redux standardisées

### Création et modification de tâche
```ascii
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
│ TodoForm │ -> │ taskSlice │ -> │ API Call │ -> │ MongoDB │
└──────────┘    └───────────┘    └──────────┘    └─────────┘
      ↓              ↓                               ↑
┌──────────┐    ┌───────┐         ┌─────────────┐  │
│ Validate │ -> │ Store │ <- - - -│ Middleware  │──┘
└──────────┘    └───────┘         └─────────────┘
```

### Authentification et sécurité
```ascii
┌────────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐
│ LoginForm  │ -> │ authSlice │ -> │ API Call │ -> │ MongoDB │
└────────────┘    └───────────┘    └──────────┘    └─────────┘
     ↓                 ↓                ↓              ↑
┌────────────┐    ┌───────┐     ┌──────────┐     ┌─────────┐
│ Validation │ -> │ Store │ <-- │ JWT Auth │ ->  │ Bcrypt  │
└────────────┘    └───────┘     └──────────┘     └─────────┘
```

### Filtrage et tri des tâches
```ascii
┌────────────┐    ┌─────────────┐    ┌────────────┐
│ UserInput  │ -> │ FilterLogic │ -> │ TodoList   │
└────────────┘    └─────────────┘    └────────────┘
      ↓                 ↓                  ↑
┌────────────┐    ┌─────────┐      ┌────────────┐
│ Categories │ -> │ Redux   │ - - >│ Selectors  │
└────────────┘    └─────────┘      └────────────┘
```

## Optimisations et performances

### Backend
- **Indexation MongoDB**:
  - Index composites pour les requêtes fréquentes
  - Index textuels pour la recherche
  - Index géospatiaux pour les données de localisation
- **Optimisation des requêtes**:
  - Projection des champs nécessaires
  - Population sélective des références
  - Agrégations optimisées
- **Middlewares avancés**:
  - Validation des données entrantes
  - Compression des réponses
  - Cache des réponses statiques
  - Rate limiting adaptatif
- **Gestion des erreurs**:
  - Système centralisé de logging
  - Monitoring des performances
  - Circuit breaker pattern

### Frontend
- **Performance du state**:
  - Mémoisation des sélecteurs Redux
  - Normalisation du state
  - Updates atomiques
- **Optimisation du rendu**:
  - React.memo pour les composants purs
  - useMemo pour les calculs coûteux
  - useCallback pour les fonctions callbacks
- **Chargement optimisé**:
  - Code splitting par routes
  - Lazy loading des composants
  - Prefetching des données
- **Caching**:
  - Mise en cache des requêtes API
  - Persistence locale avec Redux Persist
  - Caching des assets statiques

