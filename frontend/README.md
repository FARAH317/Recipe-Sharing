# frontend — React (Vite)

```bash
cd frontend
npm install
npm run dev
```
Ouvre `http://localhost:5173`. Le proxy Vite redirige déjà `/api` et `/media` vers `http://127.0.0.1:8000` en dev.

## Prod
Sur Vercel, ajoute la variable d'environnement `VITE_API_BASE` = `https://ton-backend.onrender.com/api`
(exactement comme pour le projet Expense Tracker — même piège si oublié : les appels API
tomberont en 404 relatif).
