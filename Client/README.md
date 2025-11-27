<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QcVXn9J0Q_hquoDpby_FF4WVbeCWHtI1

## Run Locally

**Prerequisites:** Node.js, MongoDB running locally at `mongodb://localhost:27017`

This project has a frontend (Vite + React) and a backend (Express + MongoDB).

1) Frontend
- From the project root:
   - Install deps: `npm install`
   - Set `GEMINI_API_KEY` in [.env.local](.env.local) (or `VITE_API_KEY`).
   - Start dev server: `npm run dev`
   - Vite runs on `http://localhost:5173` and proxies `/api/*` to the backend.

2) Backend
- In a new terminal, from `server/`:
   - Install deps: `npm install`
   - Start server: `npm start`
   - Express runs on `http://localhost:3001` with routes:
      - `POST /api/signup` { name, email, mobile, password }
      - `POST /api/login` { email, password }
      - `GET /api/health`

Notes
- During development, the frontend uses a Vite proxy so you can call relative paths like `/api/signup` without CORS issues.
- If port `5173` is occupied, adjust `server.port` in `vite.config.ts`.
