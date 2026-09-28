# Savora

Savora est une application de partage de recettes. Elle permet de découvrir des recettes, de publier les siennes avec leurs ingrédients, étapes et photos, puis de les noter et de les ajouter aux favoris.

## Fonctionnalités

- Parcourir et rechercher des recettes par titre, ingrédient, cuisine et temps de cuisson
- Créer, modifier et supprimer ses propres recettes
- Ajouter une photo, des ingrédients et des étapes à une recette
- Noter les recettes et laisser un avis
- Gérer ses favoris et s’authentifier avec des jetons JWT

## Technologies

- Frontend : React 18 et Vite
- Backend : Django 5 et Django REST Framework
- Base de données : SQLite par défaut ; PostgreSQL configurable avec `DATABASE_URL`
- Authentification : JSON Web Tokens (JWT)

## Prérequis

- Python 3.10 ou plus récent
- Node.js et npm

## Installation et lancement

Depuis la racine du projet, crée et active un environnement Python, puis installe les dépendances :

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Dans un terminal, lance le backend :

```powershell
Set-Location backend
python manage.py migrate
python manage.py runserver
```

Dans un autre terminal, lance le frontend :

```powershell
Set-Location frontend
npm install
npm run dev
```

Ouvre ensuite <http://localhost:5173>. En développement, Vite transmet automatiquement les requêtes `/api` et `/media` au backend sur `http://127.0.0.1:8000`.

SQLite est configuré par défaut et le fichier de base de données est `backend/db.sqlite3`. Pour PostgreSQL ou une autre base compatible, définis la variable d’environnement `DATABASE_URL` avant de lancer Django.

## API principale

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/token/` | Obtenir les jetons d’accès et de renouvellement |
| `POST` | `/api/token/refresh/` | Renouveler un jeton d’accès |
| `GET`, `POST` | `/api/recipes/` | Parcourir ou créer des recettes |
| `GET`, `PATCH`, `DELETE` | `/api/recipes/{id}/` | Consulter, modifier ou supprimer une recette ; les modifications sont réservées à son auteur |
| `GET`, `POST` | `/api/recipes/{id}/reviews/` | Consulter ou publier un avis et une note de 1 à 5 |
| `GET`, `POST`, `DELETE` | `/api/favorites/` | Consulter et gérer ses favoris |

La liste des recettes accepte les filtres `search`, `ingredient`, `cuisine`, `min_cook_time` et `max_cook_time`.

## Tests

Depuis `backend/` :

```powershell
python manage.py test recipes
```

Depuis `frontend/` :

```powershell
npm run build
```

## Déploiement Render et Vercel

Les fichiers `render.yaml` et `frontend/vercel.json` préconfigurent le déploiement. Le Blueprint Render crée le service Django et une base PostgreSQL ; le script de build installe les dépendances, collecte les fichiers statiques et applique les migrations.

1. Pousse le projet vers un dépôt Git et connecte ce dépôt à Render.
2. Dans Render, crée un **Blueprint** à partir du dépôt et applique `render.yaml`.
3. Copie l’URL publique du service backend Render.
4. Importe le même dépôt dans Vercel et définis `frontend` comme **Root Directory**.
5. Dans les variables d’environnement Vercel, ajoute `VITE_API_BASE` avec la valeur `https://<url-du-backend-render>/api`, puis redéploie le frontend.
6. Si tu utilises un domaine Vercel personnalisé, ajoute son origine exacte à `CORS_EXTRA_ORIGINS` dans les variables d’environnement Render. Les domaines `*.vercel.app` sont déjà autorisés.

La clé `SECRET_KEY` est générée par Render et `DEBUG` est désactivé. Pour créer un compte administrateur, ouvre le shell du service Render et exécute `python manage.py createsuperuser`.

**Stockage en production :** la base PostgreSQL du Blueprint est gratuite mais temporaire sur Render Free. Le système de fichiers des services gratuits est éphémère ; les photos envoyées dans `media/` peuvent disparaître lors d’un redémarrage ou d’un redéploiement. Pour conserver les données et les photos, utilise une base PostgreSQL payante et un disque persistant Render ou un stockage objet pour les médias.
