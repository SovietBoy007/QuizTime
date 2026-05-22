"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  username: string | null;
  avatarId: number;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(
  uid: string
): Promise<{ username: string | null; avatarId: number }> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return { username: null, avatarId: 1 };
  const data = snapshot.data();
  return {
    username: typeof data.username === "string" ? data.username : null,
    avatarId:
      typeof data.avatarId === "number" && data.avatarId >= 1 && data.avatarId <= 21
        ? data.avatarId
        : 1,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setUsername(null);
      setAvatarId(1);
      return;
    }
    const profile = await fetchProfile(auth.currentUser.uid);
    setUsername(profile.username);
    setAvatarId(profile.avatarId);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUsername(profile.username);
        setAvatarId(profile.avatarId);
      } else {
        setUsername(null);
        setAvatarId(1);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setUsername(null);
    setAvatarId(1);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, username, avatarId, loading, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
