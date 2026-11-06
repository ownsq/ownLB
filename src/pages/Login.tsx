import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "../components/Logo";
import { 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  Mail, 
  X, 
  KeyRound, 
  Ban, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";
import { isUserBanned } from "../utils/userManagementStorage";

export function Login() {
  const [email, setEmail] = useState("damika1316@gmail.com");
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("Damika");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("damika1316@gmail.com");
  const [forgotSent, setForgotSent] = useState(false);
  const [membershipType, setMembershipType] = useState<"general" | "monk">("general");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { 
    user, 
    login, 
    signInWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    sendPasswordReset, 
    authError, 
    clearAuthError, 
    isFirebaseLoading 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

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
    setSuccessMessage(null);
    clearAuthError();
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      // On success, onAuthStateChanged redirects
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    clearAuthError();

    const banCheck = isUserBanned(email.trim());
    if (banCheck.banned) {
      setErrorMessage(banCheck.reason || "This account has been suspended by Administration.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          setSubmitting(false);
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setErrorMessage("Passwords do not match.");
          setSubmitting(false);
          return;
        }

        await registerWithEmail(email, password, fullName);
        setSuccessMessage("Account created successfully! Welcome to LankaBuddhist.");
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLoginDamika = () => {
    setErrorMessage(null);
    clearAuthError();
    login("damika1316@gmail.com", "Damika");
    navigate("/");
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!forgotEmail) {
      return;
    }
    try {
      await sendPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to send password reset email.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-100/50 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-100/40 blur-[80px]" />
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-neutral-900">Reset Your Password</h3>
              </div>
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }} 
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900">Reset Link Dispatched!</h4>
                <p className="text-xs text-neutral-600">
                  Firebase has sent password reset instructions to <span className="font-semibold text-neutral-900">{forgotEmail}</span>. Please check your inbox or spam folder.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-3 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Enter your registered email address and Firebase Auth will send a secure link to reset your password.
                </p>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="you@domain.com"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="w-16 h-16 mb-2" textClassName="text-2xl mt-1" showTagline={true} layout="col" />
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-5 shadow-2xl shadow-neutral-200/60 sm:rounded-2xl sm:px-10 border border-neutral-100">
          
          {/* Quick One-Click Damika Session */}
          <div className="mb-6 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Super Admin Access
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                damika1316@gmail.com
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mb-3">
              One-click instant login as <span className="font-bold">Damika</span> (Super Admin with full privileges).
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

          {/* Google User Login Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting || submitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 border border-neutral-300 font-semibold text-sm rounded-xl flex items-center justify-center gap-3 shadow-xs hover:border-neutral-400 transition-all cursor-pointer disabled:opacity-60"
            >
              {googleSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              )}
              <span>Continue with Google</span>
            </button>

            {/* Separator */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-neutral-500 font-medium">
                  or with email & password
                </span>
              </div>
            </div>
          </div>

          {/* Form Switcher Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isRegistering 
                  ? "bg-white text-neutral-900 shadow-xs" 
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isRegistering 
                  ? "bg-white text-neutral-900 shadow-xs" 
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
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

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{successMessage}</div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-400 hover:text-emerald-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Email / Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    placeholder="Venerable or First Last"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="damika1316@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-neutral-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Membership Designation
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div 
                    onClick={() => setMembershipType("general")}
                    className={`border rounded-xl p-2.5 cursor-pointer text-center transition-all ${
                      membershipType === "general" 
                        ? "border-amber-500 bg-amber-50/70 shadow-xs" 
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-bold text-neutral-900 text-xs">Community Devotee</div>
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">Free Member</div>
                  </div>
                  <div 
                    onClick={() => setMembershipType("monk")}
                    className={`border rounded-xl p-2.5 cursor-pointer text-center transition-all ${
                      membershipType === "monk" 
                        ? "border-amber-500 bg-amber-50/70 shadow-xs" 
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-bold text-neutral-900 text-xs">Monk / Maha Thero</div>
                    <div className="text-[10px] text-amber-700 font-medium mt-0.5">Verified Profile</div>
                  </div>
                </div>
              </div>
            )}

            {!isRegistering && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-3.5 w-3.5 text-amber-600 focus:ring-amber-500 border-neutral-300 rounded"
                  />
                  <span>Remember me</span>
                </label>

                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)} 
                  className="font-semibold text-amber-700 hover:text-amber-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isRegistering ? (
                  "Create Firebase Account"
                ) : (
                  "Sign In with Firebase"
                )}
              </button>
            </div>
          </form>

          {/* Footer Terms */}
          <div className="mt-6 text-center text-[11px] text-neutral-500 leading-tight">
            Protected by Firebase Auth & Google Identity. By continuing you agree to LankaBuddhist Community Guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
