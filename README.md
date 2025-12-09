Run the demo server (upload endpoint) and frontend

## 1) Install server dependencies and start server

Open PowerShell in the project and run:

```powershell
cd server
npm install
cp .env.example .env
npm start
```

The server will listen on `http://localhost:3000` and serve uploaded files under `http://localhost:3000/uploads/<filename>`.

## 2) Serve the frontend over HTTP (recommended)

Opening `index.html` via the `file://` protocol will not allow `/upload` fetch requests to work correctly. Use a simple static server, for example with `npx http-server` or Python:

```powershell
# using http-server (Node)
npx http-server -c-1 . -p 8080
# or using Python
python -m http.server 8080
```

Then open `http://localhost:8080` in the browser.

## 3) Features added

- Client-side voice recording with MediaRecorder API
- Per-recording playback, download and delete (with confirmation modal)
- "Scarica tutte" to download a ZIP of all recordings (uses JSZip + FileSaver)
- "Elimina tutte" to clear all local recordings (with confirmation)
- Upload to `POST /upload` (requires running the server above)
- Automatic upload status tracking and logging

## 4) Deployment

### Option A: Vercel (Recommended for serverless)

```bash
npm i -g vercel
vercel login
vercel deploy
```

Configuration is in `vercel.json`. The frontend will be served statically.

### Option B: Railway (Recommended for simple server hosting)

1. Create account at [https://railway.app](https://railway.app)
2. Push to GitHub
3. Connect repo to Railway
4. Set environment variables (copy from `.env.example`)
5. Railway auto-detects `server/package.json` and deploys

Environment variable example:

```bash
PORT=3000
NODE_ENV=production
UPLOAD_DIR=/var/data/uploads
MAX_UPLOAD_SIZE=50
CORS_ORIGIN=https://your-frontend-domain.com
```

### Option C: Google App Engine

```bash
gcloud app deploy app.yaml
```

Requires Google Cloud account and `gcloud` CLI.

### Option D: Docker (self-hosted)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Security & compatibility notes

- The server saves uploads to `server/uploads/` or `$UPLOAD_DIR`.
- Files are saved as provided by the client; sanitize/validate on production.
- Browser support for `MediaRecorder` and `audio/webm` is best in Chromium/Firefox. Safari may need additional handling.
- Max upload size is configurable via `MAX_UPLOAD_SIZE` env var (default 50MB).
- CORS is wide open by default (`*`). In production, set `CORS_ORIGIN` to your frontend domain.
- Consider adding authentication, rate limiting, and file size checks for production.
