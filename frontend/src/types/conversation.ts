export interface ConversationMessage { 
    role: "staff" | "assistant"; text: string; timestamp: string; }
    
export interface Conversation {
    id: string; title: string; 
    messages: ConversationMessage[]; 
    keep: boolean; 
}

//gcloud firestore fields ttls update expireAt --collection-group=conversations --enable-ttl --project=hotel-ai-assistant-6d3c5