import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut, Mail, ShieldCheck, Phone, Check, Pencil, Upload } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase"; // ensure storage is exported from your firebase config
import { fetchProfile, updateProfile } from "../api/client";
import { Profile } from "../types/profile";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", front_desk: "Front Desk" };

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        setProfile(p);
        setNameInput(p.name ?? "");
        setPhoneInput(p.phoneNumber ?? "");
        setPhotoURL(p.photoURL ?? "");
      })
      .catch(console.error);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        alert("Please upload a valid PNG or JPEG image.");
        return;
      }
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let finalPhotoURL = photoURL;

      // 1. Upload local file to Firebase Storage if selected
      if (selectedFile && auth.currentUser) {
        const fileRef = ref(storage, `avatars/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, selectedFile);
        finalPhotoURL = await getDownloadURL(fileRef);
      }

      // 2. Call backend API with updated details
      await updateProfile({
        name: nameInput.trim(),
        phoneNumber: phoneInput.trim(),
        photoURL: finalPhotoURL.trim(),
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: nameInput.trim() || null,
              phoneNumber: phoneInput.trim() || null,
              photoURL: finalPhotoURL.trim() || null,
            }
          : prev
      );
      setEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      alert("Couldn't save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <div className="p-8 text-sm text-slate-400">Loading...</div>;

  const currentAvatar = previewURL || profile.photoURL;
  const avatarInitial = (profile.name ?? profile.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      {/* Header Avatar & Name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl font-semibold border border-slate-200 dark:border-slate-700 shrink-0">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            avatarInitial
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {profile.name ?? "Add your name"}
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                <Pencil size={13} /> Edit Profile
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ROLE_LABEL[profile.role]}</div>
        </div>
      </div>

      {/* Form Section */}
      {editing ? (
        <div className="space-y-4 mb-6 border-t border-b border-slate-100 dark:border-slate-800 py-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Upload Profile Photo (PNG / JPEG)</label>
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 w-max">
              <Upload size={14} className="text-slate-500 dark:text-slate-400" />
              <span>{selectedFile ? selectedFile.name : "Choose File..."}</span>
              <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+1 (803) 555-0199"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Check size={15} /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => { setEditing(false); setPreviewURL(null); setSelectedFile(null); }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <Mail size={15} className="text-slate-400 dark:text-slate-500" /> {profile.email}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <Phone size={15} className="text-slate-400 dark:text-slate-500" /> {profile.phoneNumber || "No phone number set"}
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <ShieldCheck size={15} className="text-slate-400 dark:text-slate-500" /> {ROLE_LABEL[profile.role]}
          </div>
        </div>
      )}

      <button
        onClick={() => signOut(auth)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
      >
        <LogOut size={15} /> Sign out
      </button>
    </div>
  );
}