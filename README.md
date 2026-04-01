# Decision Platform (Full Stack)

This is a full-stack hackathon submission for a **Configurable Workflow Decision Platform**.

## Included
- **Backend**: Express + MongoDB + Rule Engine + Audit Logs + Idempotency
- **Frontend**: Minimal React app to submit and review workflow decisions
- **Docs**: Architecture notes

---

## Project Structure
```bash
decision-platform-fullstack/
├── backend/
├── frontend/
├── docs/
└── README.md
```

---

## Backend Run
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on:
```bash
http://localhost:5000
```

### Backend Routes
- `POST /api/workflows/applicationApproval/submit`
- `GET /api/workflows/request/:id`
- `GET /api/workflows/request/:id/audit`

---

## Frontend Run
Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```bash
http://localhost:5173
```

---

## How Frontend Connects to Backend
Frontend is already wired to:
```bash
http://localhost:5000/api/workflows
```

---

## Submission Notes
This project supports:
- configurable rules via JSON
- input validation
- audit logs
- explainable decisions
- idempotency
- failure handling
- retry-ready workflow state


PORT=5000
MONGO_URI=mongodb+srv://devanshsingh9090_scoreMe:NOyneQguzumwauvW@cluster0.xkufadc.mongodb.net/ScoreME?appName=Cluster0
CLIENT_URL=http://localhost:5173
