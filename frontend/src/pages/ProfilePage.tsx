import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut, Mail, ShieldCheck, Check, Pencil } from "lucide-react";
import { auth } from "../firebase";
import { fetchProfile, updateProfile } from "../api/client";
import { Profile } from "../types/profile";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", front_desk: "Front Desk" };

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => { setProfile(p); setNameInput(p.name ?? ""); }).catch(console.error);
  }, []);

  async function saveName() {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      await updateProfile(nameInput.trim());
      setProfile((prev) => (prev ? { ...prev, name: nameInput.trim() } : prev));
      setEditingName(false);
    } catch (error) {
      console.error(error);
      alert("Couldn't save the name.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <div className="p-8 text-sm text-slate-400">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl font-semibold">
          {(profile.name ?? profile.email ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="px-2 py-1 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                placeholder="Your name"
              />
              <button onClick={saveName} disabled={saving} className="text-violet-600"><Check size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 hover:text-violet-700">
              {profile.name ?? "Add your name"}
              <Pencil size={13} className="text-slate-300" />
            </button>
          )}
          <div className="text-xs text-slate-400 mt-0.5">{ROLE_LABEL[profile.role]}</div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
          <Mail size={15} className="text-slate-400" /> {profile.email}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
          <ShieldCheck size={15} className="text-slate-400" /> {ROLE_LABEL[profile.role]}
        </div>
      </div>

      <button
        onClick={() => signOut(auth)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
      >
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}