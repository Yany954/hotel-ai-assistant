// Bounded context: "what do I do in situation X", as opposed to contacts/ which only answers
// "what's the number for X". A procedure is an ordered set of steps, each optionally gated by a
// condition, each pointing at a Contact by id (never duplicating phone numbers here).
//
// CRITICAL: isEmergency steps must be checked by the application layer BEFORE any AI
// classification runs — via a plain keyword/situation match, not model confidence. A trapped or
// injured guest can never wait on an LLM being "pretty sure". See
// docs/requirements/escalation-procedures.md.

export interface EscalationStep {
  order: number;
  condition?: string;     // e.g. "guest trapped", "reset attempted 3 times with no luck"
  contactId: string;      // references Contact.id in the contacts bounded context
  instructions: string;   // e.g. "Call fire department immediately, do not attempt further resets"
  isEmergency: boolean;
}

export interface EscalationProcedure {
  id: string;
  triggerSituation: string;   // closed label, e.g. "elevator_down", "card_declined"
  steps: EscalationStep[];
}
