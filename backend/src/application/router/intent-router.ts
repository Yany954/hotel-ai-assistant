export type Intent = "room_matching" | "contacts_directory" | "procedure";

export interface RoutedRequest {
  intent: Intent;
  rawMessage: string;
}

export interface IntentRouter {
  classify(message: string): Promise<Intent>;
}