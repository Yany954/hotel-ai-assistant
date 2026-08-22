export type Intent = "greeting" | "off_topic" | "room_matching" | "contacts_directory" | "procedure" | "general_info";

export interface RoutedRequest {
  intent: Intent;
  rawMessage: string;
}

export interface IntentRouter {
  classify(message: string): Promise<Intent>;
}