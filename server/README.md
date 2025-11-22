# NeuraCare API Server

Small Express server that powers the NeuraCare burnout detection prototype. It keeps every request local to your machine and never forwards sensitive journaling data to third-party services.

## Available Scripts

```bash
npm start   # Run the API once using Node
npm run dev # Run with nodemon reloads
npm test    # Execute Jest + Supertest suites
```

## Endpoints

| Method | Path                | Purpose                                      |
|--------|---------------------|----------------------------------------------|
| GET    | `/api/health`       | Health check                                 |
| POST   | `/api/analyze`      | Run local sentiment + burnout heuristics     |
| POST   | `/api/profile`      | Create or update a user profile              |
| GET    | `/api/profile/:id`  | Fetch stored profile                         |
| POST   | `/api/consent`      | Record consent acknowledgements              |

## Data Storage

All API data is persisted inside `data/db.json`. You may change the file location by setting the `NEURACARE_DB_PATH` environment variable (tests do this automatically to avoid race conditions).

## Privacy Notes

- No analytics or outbound calls are performed.
- Sentiment scoring uses a lightweight in-process heuristic so text never leaves the machine.
- CORS is locked down to `http://localhost:5173` by default; override via `NEURACARE_FRONTEND_ORIGIN` if needed.
