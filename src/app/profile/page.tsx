"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { validateUsername } from "@/lib/username-validation";
import { Button } from "@/components/ui/button";

type FirestoreProfile = {
  username: string;
  email: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<FirestoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        if (!snapshot.exists()) {
          setProfile(null);
          return;
        }

        const data = snapshot.data();
        const loaded: FirestoreProfile = {
          username: data.username ?? "",
          email: data.email ?? currentUser.email ?? "",
        };
        setProfile(loaded);
        setUsername(loaded.username);
      } catch {
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, authLoading, router]);

  async function handleSave() {
    if (!user) return;

    const usernameResult = validateUsername(username);

    if (!usernameResult.valid) {
      setError(usernameResult.error);
      return;
    }

    const trimmedUsername = usernameResult.username;

    setSaving(true);
    setError("");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: trimmedUsername,
      });

      setProfile((prev) =>
        prev ? { ...prev, username: trimmedUsername } : prev
      );
      await refreshProfile();
      setEditing(false);
    } catch {
      setError("Could not update username. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="text-center py-12 dark:text-gray-300">
        Se încarcă profil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 dark:text-gray-300">
        Nu s-a putut încărca profilul.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
            👤 Profilul Meu
          </h1>

          {error && (
            <div
              role="alert"
              className="mb-6 bg-red-100 dark:bg-red-950/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded"
            >
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              @{profile.username}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {profile.email}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            {editing ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Editează username
                </h3>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={saving}
                    minLength={3}
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Se salvează..." : "Salvează"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setUsername(profile.username);
                      setEditing(false);
                      setError("");
                    }}
                    disabled={saving}
                  >
                    Anulează
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)}>Editează username</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
