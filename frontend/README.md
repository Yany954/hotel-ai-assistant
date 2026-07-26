# Client (React)

Frontend for front desk staff (chat) and admins (content/user management). Talks ONLY to this
project's own backend (`src/interfaces/chat-api/`) — never directly to the Anthropic API. The
API key lives on the backend and is never sent to the browser.

```
client/
  src/
    pages/
      ChatPage.tsx        Front desk chat UI (staff-facing)
      AdminPage.tsx        Content + user management (admin-facing)
    components/            Shared UI pieces (message bubble, room result card, etc.)
    api/
      client.ts            Thin fetch wrapper around the backend's /chat and /admin endpoints
```
