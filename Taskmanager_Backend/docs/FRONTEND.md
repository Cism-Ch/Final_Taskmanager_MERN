# Documentation Technique du Frontend

## 1. Architecture du Frontend

### Structure des Dossiers
```
src/
├── assets/         # Images et ressources statiques
├── components/     # Composants React réutilisables
│   ├── icons/     # Composants d'icônes SVG
│   ├── profile/   # Composants liés au profil
│   └── TodoFilter/# Composants de filtrage des tâches
├── config/        # Configuration de l'application
├── hooks/         # Hooks React personnalisés
├── pages/         # Composants de pages
├── redux/         # Store Redux et slices
│   ├── middleware/# Middleware Redux
│   ├── selectors/ # Sélecteurs Redux
│   └── slices/    # Slices Redux
└── utils/         # Utilitaires et helpers
```

### Flux de Données (Redux)
L'application utilise Redux Toolkit pour la gestion d'état centralisée :

- **Store** : Configuré dans `redux/store.js`
- **Slices** :
  - `authSlice` : Gestion de l'authentification
  - `taskSlice` : Gestion des tâches
  - `categorySlice` : Gestion des catégories

### Gestion des États
- **États Globaux** (Redux) :
  - Authentication
  - Tâches
  - Catégories
  - Préférences utilisateur
- **États Locaux** :
  - Formulaires (login, register)
  - UI components (modals, toggles)

### Routing
L'application utilise le routing pour naviguer entre les différentes pages :

- `/` : Page d'accueil (home.jsx)
- `/login` : Page de connexion
- `/register` : Page d'inscription
- `/profile` : Page de profil utilisateur
- `/activation` : Activation du compte
- `/activation-required` : Page d'attente d'activation

## 2. Composants Principaux

### Hiérarchie des Composants
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── TodoList
│   ├── TodoCreate
│   ├── TodoListItem
│   ├── TodoComputed
│   └── TodoFilter
└── Profile
    ├── ProfileHeader
    ├── ProfileInfo
    ├── ProfileStats
    └── ActivityFeed
```

### Composants Réutilisables
- **Profile Components** :
  - `ProfileHeader` : En-tête du profil utilisateur
  - `ProfileInfo` : Informations détaillées du profil
  - `ProfileStats` : Statistiques de l'utilisateur
  - `ProfileUpdateModal` : Modal de mise à jour du profil

- **Todo Components** :
  - `TodoCreate` : Création de nouvelles tâches
  - `TodoList` : Liste des tâches
  - `TodoFilter` : Filtrage et tri des tâches
  - `TodoComputed` : Calculs et statistiques des tâches

### Logique Métier
Les composants intègrent une logique métier spécifique :
- Validation des formulaires
- Gestion des états de chargement
- Traitement des erreurs
- Filtrage et tri des données

## 3. Fonctionnalités Techniques

### Gestion du Thème
- Implémentation du dark/light mode dans `utils/darkMode.js`
- Utilisation des classes Tailwind pour le theming
- Persistance des préférences utilisateur

### Système d'Authentification
- Gestion des tokens JWT
- Protection des routes (`privateRoute.jsx`)
- Gestion des sessions
- Processus de vérification email

### Gestion des Formulaires
- Validation personnalisée (`utils/validation.js`)
- Gestion des erreurs (`utils/isFormInvalide.js`)
- Support des uploads de fichiers
- Feedback utilisateur en temps réel

### Gestion des Tâches
- CRUD complet des tâches
- Filtrage par catégorie
- Tri par date/priorité
- Pagination des résultats

### Upload d'Images
- Support des avatars utilisateur
- Validation des types de fichiers
- Prévisualisation des images
- Gestion des erreurs d'upload

## 4. Intégration API

### Configuration Axios
Configuration centralisée dans `utils/axiosConfig.js` :
- Intercepteurs de requêtes
- Gestion des tokens
- Timeouts et retries
- Headers par défaut

### Points d'Entrée API
Endpoints principaux :
```javascript
// Auth
POST /api/auth/login
POST /api/auth/register
POST /api/auth/verify

// Tasks
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

// User
GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/avatar //En developpement
```

### Gestion des Erreurs
- Intercepteurs Axios pour les erreurs
- Messages d'erreur utilisateur
- Refresh token automatique
- Retry des requêtes échouées

## 5. Performance et Optimisation

### Lazy Loading
- Routes chargées dynamiquement
- Images optimisées
- Composants importants chargés en priorité

### Memoization
- Utilisation de `useMemo` et `useCallback`
- Sélecteurs Redux memoizés
- Components React.memo pour les listes

### Bonnes Pratiques
- Code splitting
- Optimisation des images
- Minification des assets
- Caching approprié
- Debouncing des recherches
- Throttling des actions utilisateur

### Hooks Personnalisés
- `useProfileUpdate` : Gestion de la mise à jour du profil
- `useTaskFilters` : Logique de filtrage des tâches
- `useTaskSorting` : Logique de tri des tâches