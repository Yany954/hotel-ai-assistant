// frontend/src/views/admin/UsersView.tsx
import { useEffect, useState } from "react";
import { Plus, UserCircle, Link2, Check } from "lucide-react";
import PageHeader from "../../components/Admin/PageHeader";
import { Field, inputCls } from "../../components/Admin/Field";
import Modal from "../../components/Admin/Modal";
import { fetchUsers, inviteUser, resendInvite } from "../../api/client";

interface AppUser { id: string; email: string; role: "admin" | "front_desk"; status: "pending" | "active" | "inactive"; invitedAt: string; }

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-100 text-slate-500",
};
const STATUS_LABEL: Record<string, string> = { active: "Active", pending: "Invitation pending", inactive: "Inactive" };

export default function UsersView() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "front_desk">("front_desk");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { fetchUsers().then(setUsers).catch(console.error); }, []);

  async function copyToClipboard(link: string, id: string) {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function sendInvite() {
    try {
      const created = await inviteUser(email, role);
      setUsers([...users, { id: created.uid, email, role, status: "pending", invitedAt: new Date().toISOString() }]);
      setShowInvite(false);
      setEmail("");
      await copyToClipboard(created.setupLink, created.uid);
    } catch (error: any) {
      console.error(error);
      alert(error?.message ?? "Error sending the invitation.");
    }
  }

  async function copyInviteLink(u: AppUser) {
    try {
      const { setupLink } = await resendInvite(u.id);
      await copyToClipboard(setupLink, u.id);
    } catch (error: any) {
      console.error(error);
      alert(error?.message ?? "Couldn't generate a new invite link.");
    }
  }

  return (
    <>
      <PageHeader title="Users & permissions" subtitle={`${users.length} users`}
        action={<button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium"><Plus size={16} /> Invite user</button>} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">User</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Invite link</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-4 flex items-center gap-2.5">
                  <UserCircle size={18} className="text-slate-300" />
                  <span className="text-slate-700">{u.email}</span>
                </td>
                <td className="px-5 py-4 text-slate-600">{u.role === "admin" ? "Admin" : "Front Desk (chat only)"}</td>
                <td className="px-5 py-4"><span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[u.status]}`}>{STATUS_LABEL[u.status]}</span></td>
                <td className="px-5 py-4 text-right">
                  {u.status === "pending" && (
                    <button
                      onClick={() => copyInviteLink(u)}
                      className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800"
                    >
                      {copiedId === u.id ? <><Check size={13} /> Copied</> : <><Link2 size={13} /> Copy invite link</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <Modal title="Invite user" onClose={() => setShowInvite(false)}>
          <Field label="Email (Gmail)"><input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@gmail.com" /></Field>
          <Field label="Access">
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="front_desk">Chat only (front desk)</option>
              <option value="admin">Admin (chat + full panel)</option>
            </select>
          </Field>
          <button onClick={sendInvite} className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium">Send invitation</button>
        </Modal>
      )}
    </>
  );
}