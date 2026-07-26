# ADR 0001: Bounded contexts instead of one shared model

## Context
The assistant needs to answer questions from five different domains (rooms, third-party
escalation, contacts, shift duties, maintenance). Each has its own vocabulary and data shape.

## Decision
Following Evans (DDD), each domain is modeled as its own bounded context under
`src/domain/<context>/`, with its own entities, value objects, and repository interface. Contexts
do not share a data model. A single application-layer router (see
`src/application/router/`) decides which context's use case to invoke — this is the only place
that "knows about" more than one context, acting as the translation/orchestration layer.

## Consequence
Following Martin (Clean Architecture), `src/domain/` has zero external dependencies. Everything
in `src/infrastructure/` depends inward on domain interfaces, never the reverse. This means the
storage choice (Postgres vs. a vector store) or the LLM provider can change without touching
business rules.
