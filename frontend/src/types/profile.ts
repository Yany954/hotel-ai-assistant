export interface Profile { 
    uid: string; email: string | null; 
    role: "admin" | "front_desk"; 
    name: string | null; 
}