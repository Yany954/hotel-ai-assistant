export interface ConversationMessage { role: "staff" | "assistant"; text: string; timestamp: string; }
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ConversationMessage[];
  keep: boolean;
}