# Task Manager Frontend

Ce projet est l'interface utilisateur (frontend) pour une application de gestion de tâches, développée avec React et Vite.

## Description

L'application permet aux utilisateurs de créer, visualiser, mettre à jour et supprimer des tâches. Elle interagit avec une API backend pour la persistance des données.

## Démarrage rapide (Configuration locale)

Suivez ces étapes pour exécuter le projet sur votre machine locale.

### Prérequis

- Node.js (version 18.x ou supérieure recommandée)
- pnpm ou yarn

### Étapes d'installation

1.  **Cloner le dépôt :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd Taskmanager_Frontend
    ```

2.  **Installer les dépendances :**
    ```bash
    pnpm install
    # ou
    yarn install
    ```

3.  **Configurer les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet et ajoutez les variables nécessaires. Par exemple :
    ```env
    # .env
    VITE_URL=http://localhost:3000
    ```
    Pour le deploiment sur render! vous pouvez utiliser les variables d'environnement de render! pour la configuration de votre application.


    Remplacez `http://localhost:3000` par l'URL de votre API backend si elle est différente.

4.  **Lancer le serveur de développement :**
    ```bash
    pnpm run dev
    # ou
    yarn dev
    ```

L'application devrait maintenant être accessible sur `http://localhost:5173` (ou un autre port indiqué dans la console). 
    Par exemple celle de render! : `https://<nom-de-mon-projet>.render.com`


## Scripts disponibles

- `pnpm run dev` ou `yarn dev`: Lance l'application en mode développement.
- `pnpm run build` ou `yarn build`: Construit l'application pour la production.
- `pnpm run preview` ou `yarn preview`: Sert localement la version de production construite.
