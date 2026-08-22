Aqui tienes la traducción en texto plano:

# Hotel Front Desk AI Assistant — Pilot

Pilot: room matching + contacts directory. See docs/system-boundary.md for full scope and docs/adr/0001-bounded-contexts.md for architectural rationale.

## Structure

docs/                       Requirements and decisions — written BEFORE coding (Wiegers)
backend/                    Node.js + TypeScript
src/
domain//       Pure business rules, no external dependencies (Clean Architecture)
application/            Use cases + intent router (only layer aware of >1 context)
infrastructure/         Concrete adapters: Firebase, vector store, LLM (Anthropic), auth
interfaces/             Entry points: chat API, admin panel API
tests/
package.json
frontend/                   React
src/
pages/                  ChatPage (staff), AdminPage (admin)
api/                    Calls ONLY the backend — never directly to Anthropic
package.json

## How to Run Each Folder

Backend (Node.js) — exposes the API and holds the Anthropic API key:

cd backend
npm install
npm run dev

Starts the server in watch mode (auto-reload on save). The chat endpoint lives in src/interfaces/chat-api/server.ts.

Frontend (React) — the interface used by front desk staff and admins:

cd frontend
npm install
npm run dev

Starts Vite's development server (default: http://localhost:5173). Requires the backend to be running to handle messages (see frontend/src/api/client.ts).

## Dependency Rule (Clean Architecture)

Inside backend/src/, domain imports nothing from infrastructure or interfaces. All dependencies point inward. This guarantees that switching from Postgres to another database, or changing LLM providers, leaves business rules untouched.

## Persistence and Auth (Pilot Decision)

Firestore for rooms and contacts (see backend/src/infrastructure/persistence/firestore/README.md for trade-offs), Firebase Auth for authentication with custom claims (admin / front_desk). Both sit behind RoomRepository/ContactRepository/rbac.ts, ensuring future changes won't break the domain or use cases.

## Data Ingestion

Admins NEVER write directly to Firestore from React. frontend/src/pages/AdminPage.tsx calls backend/src/interfaces/admin-api/ (rooms.ts, contacts.ts, users.ts), which enforces roles via requireRole("admin") before writing. A single, fully auditable write path.

## Architectural Health Check

cd backend
npm install
npm run check-architecture

Runs dependency-cruiser against rules in .dependency-cruiser.cjs. Fails if domain/ imports from infrastructure/ or interfaces/, or if application/ imports a concrete adapter instead of a port. Run this frequently during development.

Acceptance tests (backend/tests/acceptance/) also run against the actual repository (omitting the LLM) to confirm filtering complies with docs/requirements/room-matching.md before layering AI on top.

