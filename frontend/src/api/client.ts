// The ONLY file allowed to know the backend's URL. Every LLM call goes through our own backend
// (src/interfaces/chat-api/), never straight from the browser to Anthropic — the API key must
// never reach client-side code.

import { Room } from "../types/room";
import {Contact} from "../types/contact";
import { auth } from "../firebase";
import { EscalationProcedure } from "../types/escalation";
import { Conversation, ConversationMessage } from "../types/conversation";
import { Profile } from "../types/profile";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `${options?.method ?? "GET"} ${path} failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

//Auth
export const markUserActive = () => request<void>("/me/activate", { method: "POST" });
export const fetchUsers = () => request<any[]>("/admin/users");
export const inviteUser = (email: string, role: "admin" | "front_desk") =>
  request<any>("/admin/users", { method: "POST", body: JSON.stringify({ email, role }) });

//Rooms
export const fetchRooms = () => request<Room[]>("/admin/rooms");
export const createRoom = (room: Omit<Room, "id">) =>
  request<Room>("/admin/rooms", { method: "POST", body: JSON.stringify(room) });
export const updateRoom = (id: string, patch: Partial<Omit<Room, "id">>) =>
  request<Room>(`/admin/rooms/${id}`, { method: "PUT", body: JSON.stringify(patch) });
export const deleteRoom = (id: string) => request<void>(`/admin/rooms/${id}`, { method: "DELETE" });
export const importRoomsCsv = (rooms: Omit<Room, "id">[]) =>
  request<Room[]>("/admin/rooms/import", { method: "POST", body: JSON.stringify({ rooms }) });

// Contacts
export const fetchContacts = () => request<Contact[]>("/admin/contacts");
export const createContact = (contact: Omit<Contact, "id">) =>
  request<Contact>("/admin/contacts", { method: "POST", body: JSON.stringify(contact) });
export const updateContact = (id: string, patch: Partial<Omit<Contact, "id">>) =>
  request<Contact>(`/admin/contacts/${id}`, { method: "PUT", body: JSON.stringify(patch) });
export const deleteContact = (id: string) => request<void>(`/admin/contacts/${id}`, { method: "DELETE" });

//Procedures
export const fetchProcedures = () => request<EscalationProcedure[]>("/admin/procedures");
export const createProcedure = (procedure: Omit<EscalationProcedure, "id">) =>
  request<EscalationProcedure>("/admin/procedures", { method: "POST", body: JSON.stringify(procedure) });
export const updateProcedure = (id: string, patch: Partial<Omit<EscalationProcedure, "id">>) =>
  request<EscalationProcedure>(`/admin/procedures/${id}`, { method: "PUT", body: JSON.stringify(patch) });
export const deleteProcedure = (id: string) => request<void>(`/admin/procedures/${id}`, { method: "DELETE" });
export const askStaffQuery = (message: string) =>
  request<any>("/chat", { method: "POST", body: JSON.stringify({ message }) });

// Conversations
export const fetchConversations = () => request<Conversation[]>("/conversations");
export const createConversation = (title?: string) =>
  request<{ id: string }>("/conversations", { method: "POST", body: JSON.stringify({ title }) });
export const updateConversation = (id: string, patch: { messages?: ConversationMessage[]; title?: string; keep?: boolean }) =>
  request<void>(`/conversations/${id}`, { method: "PUT", body: JSON.stringify(patch) });

// Profile
export const fetchProfile = () => request<Profile>("/me");
export const updateProfile = (name: string) => request<void>("/me", { method: "PATCH", body: JSON.stringify({ name }) });