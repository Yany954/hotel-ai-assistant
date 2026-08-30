// frontend/src/pages/LoginPage.tsx
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { auth } from "../firebase";
import { markUserActive } from "../api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let user;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user = result.user;
    } catch (err) {
      console.error(err);
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    try {
      const tokenResult = await user.getIdTokenResult();
      await markUserActive();
      navigate(tokenResult.claims.role === "admin" ? "/admin" : "/chatpage");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Signed in, but something went wrong finishing setup. Try again or contact an admin.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email first.");
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/set-password`, handleCodeInApp: true });
      setResetSent(true);
    } catch (err) {
      console.error(err);
      setResetSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (forgotMode) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white" size={22} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Reset your password</h1>

          {resetSent ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 mb-6">
                If an account exists for <strong>{email}</strong>, a reset link is on its way — check your inbox.
              </p>
              <button
                onClick={() => { setForgotMode(false); setResetSent(false); setError(null); }}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                Back to sign in
              </button>
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="text-left mt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">Enter your email and we'll send you a reset link.</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
              />
              {error && <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 mb-3"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => { setForgotMode(false); setError(null); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-white" size={22} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Front Desk AI</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in with your invited account.</p>

        <form onSubmit={handleLogin} className="text-left">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
          />
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setForgotMode(true); setError(null); }}
            className="w-full text-center text-xs text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 mt-3"
          >
            Forgot your password?
          </button>
        </form>
      </div>
    </div>
  );
}