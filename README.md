# Hotel Front Desk AI Assistant — pilot

Piloto: **room matching** + **contacts directory**. Ver `docs/system-boundary.md` para alcance
completo y `docs/adr/0001-bounded-contexts.md` para el razonamiento de arquitectura.

## Estructura

```
docs/                       Requisitos y decisiones — se escriben ANTES de programar (Wiegers)
backend/                    Node.js + TypeScript
  src/
    domain/<context>/       Reglas de negocio puras, sin dependencias externas (Clean Architecture)
    application/            Casos de uso + router de intención (única pieza que conoce >1 contexto)
    infrastructure/         Adaptadores concretos: Postgres, vector store, LLM (Anthropic), auth
    interfaces/              Puntos de entrada: chat API, admin panel API
  tests/
  package.json
frontend/                   React
  src/
    pages/                  ChatPage (staff), AdminPage (admin)
    api/                    Llama SOLO al backend propio — nunca directo a Anthropic
  package.json
```

## Cómo correr cada carpeta

**Backend (Node.js)** — expone la API y es el único que tiene la API key de Anthropic:
```
cd backend
npm install
npm run dev
```
Esto levanta el servidor en modo watch (recarga automática al guardar). El endpoint de chat vive
en `src/interfaces/chat-api/server.ts` — hoy es un TODO, se implementa ahí.

**Frontend (React)** — la interfaz que usa el personal de front desk y el admin:
```
cd frontend
npm install
npm run dev
```
Levanta el servidor de desarrollo de Vite (por defecto en `http://localhost:5173`). Necesita que
el backend esté corriendo para poder mandarle mensajes (ver `frontend/src/api/client.ts`).

## Regla de dependencia (Clean Architecture)
Dentro de `backend/src/`, `domain` no importa nada de `infrastructure` ni `interfaces`. Todo
apunta hacia adentro. Así, cambiar de Postgres a otra base, o de proveedor de LLM, no toca las
reglas de negocio.

## Persistencia y auth (decisión del piloto)
Firestore para `rooms` y `contacts` (ver `backend/src/infrastructure/persistence/firestore/README.md`
para los trade-offs), Firebase Auth para autenticación con custom claims (`admin` / `front_desk`).
Ambas están detrás de `RoomRepository`/`ContactRepository`/`rbac.ts`, así que cambiarlas después no
rompe el dominio ni los casos de uso.

## Cómo se cargan los datos
El admin NUNCA escribe directo a Firestore desde React. `frontend/src/pages/AdminPage.tsx` llama a
`backend/src/interfaces/admin-api/` (rooms.ts, contacts.ts, users.ts), que valida el rol con
`requireRole("admin")` y recién ahí escribe. Un solo camino de escritura, todo auditable.

## Cómo verificar que la arquitectura no se está rompiendo
```
cd backend
npm install
npm run check-architecture
```
Esto corre `dependency-cruiser` con las reglas en `.dependency-cruiser.cjs`: falla si `domain/`
llega a importar algo de `infrastructure/` o `interfaces/`, o si `application/` importa un adaptador
concreto en vez de un puerto. Corre esto seguido mientras implementas — es más confiable que
revisarlo a ojo.

También corre los tests de aceptación (`backend/tests/acceptance/`) contra el repositorio real,
sin el LLM de por medio, para confirmar que el filtrado cumple `docs/requirements/room-matching.md`
antes de sumar la capa de IA encima.

## Próximo bounded context a agregar
Cuando el piloto esté validado con uso real: `third-party-escalation`, siguiendo el mismo patrón
que `rooms/` y `contacts/`. Ver `backend/src/domain/_future-contexts/README.md`.
