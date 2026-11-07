import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  db,
  FirebaseUser 
} from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "Free" | "Premium" | "Monk";
  isFirebaseUser?: boolean;
  role?: "Super Admin" | "Moderator" | "Verified Seller" | "Member";
  provider?: "google" | "password" | "quick";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isFirebaseLoading: boolean;
}

const DEFAULT_USER: User = {
  id: "damika-user",
  name: "Damika",
  email: "damika1316@gmail.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  plan: "Premium",
  role: "Super Admin",
  provider: "quick"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthError(err: unknown): string {
  if (!err) return "An unexpected authentication error occurred.";
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) {
    return "Invalid email address or password. Please verify your credentials.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "An account with this email address already exists. Please sign in instead.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in popup was closed before completion.";
  }
  if (msg.includes("auth/popup-blocked")) {
    return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
  }
  if (msg.includes("auth/network-request-failed")) {
    return "Network connection issue. Please check your internet connection.";
  }
  return msg.replace(/^Firebase:\s*/, "");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("lanka_user");
      if (stored) {
        return JSON.parse(stored);
      }
      const isLoggedOut = localStorage.getItem("lanka_logged_out") === "true";
      if (!isLoggedOut) {
        localStorage.setItem("lanka_user", JSON.stringify(DEFAULT_USER));
        return DEFAULT_USER;
      }
      return null;
    } catch {
      return DEFAULT_USER;
    }
  });

  const clearAuthError = () => setAuthError(null);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setIsFirebaseLoading(false);
      if (fbUser) {
        const isAdminEmail = fbUser.email?.toLowerCase() === "damika1316@gmail.com";
        const isGoogle = fbUser.providerData.some(p => p.providerId === "google.com");

        let role: "Super Admin" | "Moderator" | "Verified Seller" | "Member" = isAdminEmail ? "Super Admin" : "Member";

        // Check or sync Firestore user profile
        try {
          const userDocRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.isBanned) {
              setAuthError("This account has been suspended by the administration.");
              await signOut(auth);
              setUser(null);
              localStorage.removeItem("lanka_user");
              localStorage.setItem("lanka_logged_out", "true");
              return;
            }
            if (data.role && !isAdminEmail) {
              role = data.role as any;
            }
          } else {
            // Create user profile matching isValidUser schema from firestore.rules
            const newUserProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Community Member",
              email: fbUser.email || "",
              role: "Member",
              isPhoneVerified: false,
              isBanned: false,
              avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUserProfile);
          }

          if (isAdminEmail) {
            await setDoc(doc(db, "admins", fbUser.uid), {
              userId: fbUser.uid,
              email: fbUser.email,
              role: "Super Admin",
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (syncErr) {
          console.warn("Firestore user sync warning:", syncErr);
        }

        const customUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Community Member",
          email: fbUser.email || "",
          avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          plan: "Premium",
          role: role,
          isFirebaseUser: true,
          provider: isGoogle ? "google" : "password"
        };

        setUser(customUser);
        localStorage.removeItem("lanka_logged_out");
        localStorage.setItem("lanka_user", JSON.stringify(customUser));
      } else {
        const isLoggedOut = localStorage.getItem("lanka_logged_out") === "true";
        if (isLoggedOut) {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      setIsFirebaseLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error("Google sign in error: ", err);
      const friendly = mapAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  const loginWithEmail = async (_email: string, _password: string) => {
    const errorMsg = "Company and password logins are disabled. Only personal Google accounts can log in. Please use 'Continue with Google'.";
    setAuthError(errorMsg);
    throw new Error(errorMsg);
  };

  const registerWithEmail = async (_email: string, _password: string, _name: string) => {
    const errorMsg = "Direct email registration is disabled. Only individuals with a Google account can create an account. Please use 'Continue with Google'.";
    setAuthError(errorMsg);
    throw new Error(errorMsg);
  };

  const sendPasswordReset = async (_email: string) => {
    const errorMsg = "Password reset is disabled because logins and account creations are managed exclusively via Google Accounts. Please use 'Continue with Google'.";
    setAuthError(errorMsg);
    throw new Error(errorMsg);
  };

  const login = (email: string, name?: string) => {
    const displayName =
      name ||
      (email.toLowerCase().includes("damika")
        ? "Damika"
        : email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));

    const loggedInUser: User = {
      id: "damika-user",
      name: displayName,
      email: email,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      plan: "Premium",
      role: email.toLowerCase() === "damika1316@gmail.com" ? "Super Admin" : "Member",
      provider: "quick"
    };

    localStorage.removeItem("lanka_logged_out");
    localStorage.setItem("lanka_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase sign out:", e);
    }
    localStorage.removeItem("lanka_user");
    localStorage.setItem("lanka_logged_out", "true");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      signInWithGoogle, 
      loginWithEmail, 
      registerWithEmail, 
      sendPasswordReset, 
      authError, 
      clearAuthError, 
      isFirebaseLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
