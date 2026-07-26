// Delivery mechanism (Clean Architecture outermost ring). Front desk chat endpoint.
// Wires router -> use cases. Swappable for a different transport (Slack bot, web widget, etc.)
// without touching domain/application code.

// TODO: e.g. Express/Fastify server exposing POST /chat
