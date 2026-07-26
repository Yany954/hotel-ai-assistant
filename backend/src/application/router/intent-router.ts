// The ONLY component allowed to know about more than one bounded context.
// Classifies the incoming staff question and dispatches to the right use case.
// Deliberately thin: one LLM call to classify intent, then a direct function call —
// not five separate agent round-trips (keeps cost close to a single lookup, per the proposal).

export type Intent = "room_matching" | "contacts_directory"; // extend as future contexts land

export interface RoutedRequest {
  intent: Intent;
  rawMessage: string;
}

export interface IntentRouter {
  classify(message: string): Promise<Intent>;
}
