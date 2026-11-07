import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "../components/Logo";
import { 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  X, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  ShieldCheck,
  Check,
  Globe,
  Heart
} from "lucide-react";

export function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { 
    user, 
    login, 
    signInWithGoogle, 
    authError, 
    clearAuthError, 
    isFirebaseLoading 
  } = useAuth();
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Sync authError from AuthContext
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    clearAuthError();
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in AuthContext will update state and redirect
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in with Google. Please check your popup settings.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleQuickLoginDamika = () => {
    setErrorMessage(null);
    clearAuthError();
    login("damika1316@gmail.com", "Damika");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-100/50 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[80px]" />
      </div>

      {/* Header with Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="w-16 h-16 mb-2" textClassName="text-2xl mt-1" showTagline={true} layout="col" />
        <h2 className="mt-4 text-center text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Welcome to LankaBuddhist
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500 max-w-sm">
          The global spiritual & community platform for Sri Lankans worldwide
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-neutral-200/60 sm:rounded-2xl sm:px-10 border border-neutral-100 space-y-6">
          
          {/* Super Admin Quick Access */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Super Admin Access
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                damika1316@gmail.com
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mb-3">
              One-click instant login as <span className="font-bold">Damika</span> (Super Admin with full permissions).
            </p>
            <button
              type="button"
              onClick={handleQuickLoginDamika}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Quick Log In as Damika
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Google Account Requirement Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-blue-900">
            <div className="flex items-center gap-2 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Google Account Exclusivity</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/90">
              Only individuals with a personal <strong className="font-semibold text-blue-950">Google Account</strong> can create an account and join our community. Corporate, generic, and password-only registrations are disabled to preserve community integrity.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
              <button 
                onClick={() => {
                  setErrorMessage(null);
                  clearAuthError();
                }}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary Action: Sign in / Create Account with Google */}
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting || isFirebaseLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 border-2 border-neutral-300 font-bold text-sm rounded-xl flex items-center justify-center gap-3 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {googleSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-neutral-500">
              Sign in or create a new account in one step using your personal Google Account.
            </p>
          </div>

          {/* Benefits of Google Authentication */}
          <div className="pt-4 border-t border-neutral-100 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Why Google Account Only?
            </h4>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Passwords to Remember:</strong> Secure 2-factor authentication powered by Google.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bot & Spam-Free:</strong> Keeps temple discussions, monk Dana bookings, and listings genuine.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Instant Sync:</strong> Save temple visits, bookmark sermons, and participate in community boards.</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-2 text-center text-[10px] text-neutral-400 leading-tight">
            Protected by Firebase Authentication & Google Identity Services. By continuing you agree to LankaBuddhist Community Standards.
          </div>
        </div>
      </div>
    </div>
  );
}
