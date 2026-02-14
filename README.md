# Al-Shalawi Gold Factory — Backend

Simple Node.js backend with image upload and thumbnail generation.

Files created:
- `server.js` — Express server with `/health` and `/upload` endpoints.
- `package.json` — dependencies and start scripts.

Run locally:

```bash
cd "c:\Users\Reda Mohsen\Downloads\al-shalawi-backend"
npm install
npm start
```

Upload example (multipart form): field name `image` to `POST http://localhost:5000/upload`.

Build and run with Docker (uses provided Dockerfile):

```bash
# from the folder containing Dockerfile (if you placed it here)
docker build -t al-shalawi-backend .
docker run --rm -p 5000:5000 -v "%CD%/uploads":/app/uploads al-shalawi-backend
```

Notes:
- The Dockerfile expects production install; for local development install dev dependencies if needed.
- Uploaded files are served under `/uploads` static path.

Deploy to Render
---------------

1. Push this repository to GitHub (or another supported Git provider).
2. On render.com, create a new **Web Service** and connect your repo.
	- Choose the **Docker** environment and keep the default `Dockerfile` path.
3. Render will build the Docker image using the included `Dockerfile` and
	expose the service. The app listens on `process.env.PORT` (Render provides it).

Quick checklist before deploying:
- Ensure `Dockerfile` is at the repository root.
- Do not commit large `uploads` folders (the `.dockerignore` excludes them).

If you prefer not to use Docker, you can deploy as a Node service on Render:

1. Create a Web Service and select the Node environment.
2. Set the start command to `npm start`.
3. Ensure the repository's `package.json` contains the `start` script (already present).

