// frontend/src/pages/LoginPage.tsx
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { markUserActive } from "../api/client";

export function LoginPage() {
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const tokenResult = await result.user.getIdTokenResult();
      await markUserActive(); // marca status: "active" en Firestore la primera vez
      const role = tokenResult.claims.role;
      navigate(role === "admin" ? "/admin" : "/chatpage");
    } catch (error) {
      console.error(error);
      alert("There was an error logging in. Was your account invited by an admin?");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-white" size={22} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Front Desk AI</h1>
        <p className="text-sm text-slate-500 mb-6">Log in with your guest account.</p>
        <button onClick={handleGoogleLogin} className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90">
          Log in with Google
        </button>
      </div>
    </div>
  );
}