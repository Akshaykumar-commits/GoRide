# GoRide: full-stack ride-hailing app

```
frontend/            what users see (HTML, CSS, JavaScript)
  index.html
  css/style.css
  js/app.js          city map, routing, fares, ride flow
  js/config.js       backend URL (set this for GitHub Pages)
  js/i18n.js         English, Telugu, Hindi text
  js/account.js      login, account, wallet, saved places, schedule, SOS...
backend/             Node.js API (no npm install needed)
  server.js          signup/login, profile, wallet and rides storage, admin stats, serves frontend
  test.js            15-check smoke test: node backend/test.js
Dockerfile, render.yaml, .env.example, .github/workflows/pages.yml
```

## Run locally
`node backend/server.js` then open http://localhost:3000 (Node 18+).

## Put it online
1. Backend: deploy the repo on Render (uses `render.yaml`) or any Node/Docker host. Set `SECRET`, and `ADMIN_KEY` for `/api/admin/stats`.
2. Frontend on GitHub Pages: repo Settings > Pages > Source: GitHub Actions. The workflow publishes `frontend/`.
   Then set `window.GORIDE_API` in `frontend/js/config.js` to your backend URL, and `ALLOWED_ORIGIN` on the backend to your Pages URL.
   (Or skip this: the Node server already serves the frontend, so one deploy is enough.)
No backend reachable? Login falls back to browser-only accounts on that device.

## Notes
Data is stored in `backend/data.json` (fine for a demo; use a real database for heavy traffic).
Drivers, map and payments are simulated. Replace `support@goride.example` in `js/account.js` with your email.
