import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { auth } from "../firebase";

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      setStatus("invalid");
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((verifiedEmail) => { setEmail(verifiedEmail); setStatus("valid"); })
      .catch(() => setStatus("invalid"));
  }, [oobCode, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setStatus("done");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err?.message ?? "Couldn't set the password — the link may have expired.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-white" size={22} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Front Desk AI</h1>

        {status === "checking" && <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Checking your invite link...</p>}

        {status === "invalid" && (
          <>
            <p className="text-sm text-rose-600 dark:text-rose-400 mt-4 mb-2">This link is invalid or has expired.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ask an admin to send you a new invite from the Users panel.</p>
          </>
        )}

        {status === "valid" && (
          <form onSubmit={handleSubmit} className="mt-4 text-left">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">Setting a password for <strong>{email}</strong></p>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
              placeholder="At least 8 characters"
            />
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
            />
            {error && <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Setting password..." : "Set password"}
            </button>
          </form>
        )}

        {status === "done" && (
          <div className="mt-4">
            <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={28} />
            <p className="text-sm text-slate-600 dark:text-slate-300">Password set! Redirecting you to sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
}