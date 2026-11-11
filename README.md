# GoRide v2

Files: `index.html` (the whole app: map, login, account, all buttons), `backend/server.js`, `package.json`, `.gitignore`.

Run with the backend: `node backend/server.js` then open http://localhost:3000 (Node 18+, no install step).
Set a fixed secret in production: `SECRET=long-random-text node backend/server.js`.

No backend (e.g. GitHub Pages)? Login still works: accounts are then saved in that browser only.
For shared accounts, deploy `backend/` on Render / Railway / Fly.io and set `API` at the top of the second `<script>` in `index.html` to its URL.

Features: bigger city map; login/signup; header buttons (Ride, Activity, Account, language, wallet);
Home/Work quick buttons, Schedule ride, Wallet / Offers / Safety / Help shortcuts on the ride screen;
Book again + Receipt in Activity; Share trip, SOS with emergency contacts, Report issue;
profile, saved places, wallet top-up, default payment and ride type, coupons, referral code,
notification and sound settings, change password, download data, delete account; English, Telugu, Hindi.
Replace `support@goride.example` in `index.html` with your support email.
