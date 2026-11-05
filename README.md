# E-Todo

Application de gestion de tâches : une API REST avec authentification JWT et une interface web légère.

## Fonctions

- Inscription et connexion
- Création, lecture, modification et suppression des tâches
- Gestion du compte utilisateur

## Stack

Node.js, Express, MySQL, JSON Web Token, bcrypt, HTML, CSS et JavaScript sans framework, Docker Compose.

## Démarrer en local

```bash
cd e-todo
docker compose up --build
```

L'interface répond sur [localhost:8080](http://localhost:8080). Le schéma de la base est dans `e-todo/e-todo.sql`.
