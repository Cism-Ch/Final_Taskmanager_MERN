# TaskManager MERN

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-Latest-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Une application web de gestion de tâches complète et moderne, construite avec la stack MERN (MongoDB, Express.js, React, Node.js). Elle offre une interface utilisateur intuitive et réactive pour gérer efficacement vos tâches quotidiennes.

## ✨ Fonctionnalités Principales

- **Gestion Complète des Tâches**
  - Création, modification et suppression de tâches
  - Catégorisation et filtrage avancé
  - Système de dates limites
  - Tri personnalisable

- **Système d'Authentification Robuste**
  - Inscription et connexion sécurisées
  - Vérification d'email en deux étapes
  - Gestion de profil avec avatar
  - Statistiques utilisateur

- **Interface Moderne**
  - Design responsive avec Tailwind CSS
  - Mode sombre/clair
  - Animations fluides avec Framer Motion
  - Notifications en temps réel

## 🚀 Technologies Utilisées

### Frontend
- **Core**: React 18, Vite
- **State Management**: Redux Toolkit, Redux Persist
- **UI/UX**: 
  - Tailwind CSS
  - Framer Motion
  - HeadlessUI
  - React Hot Toast
- **Routing**: React Router DOM
- **Formulaires**: React Hook Form
- **HTTP**: Axios

### Backend
- **Core**: Node.js, Express.js
- **Base de données**: MongoDB, Mongoose
- **Sécurité**: JWT, bcryptjs, Joi
- **Email**: Nodemailer, Handlebars
- **Upload**: Multer
- **Cache**: node-cache
- **Tests**: Jest

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB (version 4.4 ou supérieure)
- pnpm (gestionnaire de paquets)

## 🛠 Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/votre-username/taskmanager-mern.git
cd taskmanager-mern
```

2. **Installer les dépendances**
```bash
# Installation des dépendances du backend
cd Taskmanager_Backend
pnpm install

# Installation des dépendances du frontend
cd ../Taskmanager_Frontend
pnpm install
```

3. **Configuration**
   - Créer un fichier `.env` dans le dossier `Taskmanager_Backend` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=votre_secret_jwt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe
```

4. **Lancer l'application**
```bash
# Démarrer le backend (depuis Taskmanager_Backend)
pnpm start

# Démarrer le frontend (depuis Taskmanager_Frontend)
pnpm dev
```

## 📁 Structure du Projet

```
taskmanager-mern/
├── Taskmanager_Backend/         # Backend Express.js
│   ├── controllers/            # Contrôleurs de l'API
│   ├── db/                    # Configuration et modèles MongoDB
│   ├── middlewares/           # Middlewares (auth, upload, etc.)
│   ├── routes/                # Routes de l'API
│   └── utilitaire/           # Utilitaires et helpers
│
└── Taskmanager_Frontend/       # Frontend React
    ├── src/
    │   ├── components/        # Composants React
    │   ├── pages/            # Pages de l'application
    │   ├── redux/            # Configuration Redux
    │   └── utils/            # Utilitaires
    └── public/               # Assets publics
```

## 💻 Commandes Utiles

### Backend
```bash
pnpm start          # Démarrer le serveur
pnpm dev            # Démarrer avec nodemon (développement)
pnpm test           # Lancer les tests
```

### Frontend
```bash
pnpm dev            # Démarrer le serveur de développement
pnpm build          # Construire pour la production
pnpm preview        # Prévisualiser la build de production
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'feat: Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.