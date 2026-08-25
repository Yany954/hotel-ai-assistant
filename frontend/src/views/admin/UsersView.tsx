import { useEffect, useState } from "react";
import { Plus, UserCircle, Link2, Check, UserX, UserCheck, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../../components/Admin/PageHeader";
import { Field, inputCls } from "../../components/Admin/Field";
import Modal from "../../components/Admin/Modal";
import { fetchUsers, inviteUser, resendInvite, updateUserStatus, deleteUser } from "../../api/client";

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
      Swal.fire({
        icon: "success",
        title: "Invitation Sent!",
        text: "The invite link has been copied to your clipboard.",
        confirmButtonColor: "#7c3aed",
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message ?? "Error sending the invitation.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  async function copyInviteLink(u: AppUser) {
    try {
      const { setupLink } = await resendInvite(u.id);
      await copyToClipboard(setupLink, u.id);
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message ?? "Couldn't generate a new invite link.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  async function handleToggleStatus(u: AppUser) {
    const newStatus = u.status === "inactive" ? "active" : "inactive";
    const actionText = newStatus === "inactive" ? "deactivate" : "reactivate";

    const result = await Swal.fire({
      title: `${newStatus === "inactive" ? "Deactivate" : "Reactivate"} User?`,
      text: `Are you sure you want to ${actionText} ${u.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "inactive" ? "#0685d9" : "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${actionText}`,
    });

    if (!result.isConfirmed) return;

    try {
      await updateUserStatus(u.id, newStatus);
      setUsers(users.map((item) => (item.id === u.id ? { ...item, status: newStatus } : item)));
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `User is now ${newStatus}.`,
        confirmButtonColor: "#7c3aed",
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message ?? "Couldn't change user status.",
        confirmButtonColor: "#7c3aed",
      });
    }
  }

  async function handleDeleteUser(u: AppUser) {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `Are you sure you want to permanently delete ${u.email}? This action cannot be undone.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUser(u.id);
      setUsers(users.filter((item) => item.id !== u.id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The user has been permanently deleted.",
        confirmButtonColor: "#7c3aed",
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message ?? "Couldn't delete user.",
        confirmButtonColor: "#7c3aed",
      });
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
              <th className="text-right px-5 py-3 font-medium">Actions</th>
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
                  <div className="flex items-center justify-end gap-3">
                    {u.status === "pending" && (
                      <button
                        onClick={() => copyInviteLink(u)}
                        className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium"
                      >
                        {copiedId === u.id ? <><Check size={13} /> Copied</> : <><Link2 size={13} /> Copy link</>}
                      </button>
                    )}

                    {u.status !== "pending" && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          u.status === "inactive" ? "text-blue-600 hover:text-blue-800" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {u.status === "inactive" ? <><UserCheck size={14} /> Reactivate</> : <><UserX size={14} /> Deactivate</>}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium"
                      title="Delete User"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
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