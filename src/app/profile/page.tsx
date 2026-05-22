"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { validateUsername } from "@/lib/username-validation";
import DailyQuizCard from "@/components/DailyQuizCard";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";

const AVATAR_COUNT = 21;
const AVATAR_IDS = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1);

type FirestoreProfile = {
  username: string;
  email: string;
  avatarId: number;
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
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(1);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);

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
        const loadedAvatarId =
          typeof data.avatarId === "number" &&
          data.avatarId >= 1 &&
          data.avatarId <= 21
            ? data.avatarId
            : 1;

        const loaded: FirestoreProfile = {
          username: data.username ?? "",
          email: data.email ?? currentUser.email ?? "",
          avatarId: loadedAvatarId,
        };
        setProfile(loaded);
        setUsername(loaded.username);
        setSelectedAvatarId(loadedAvatarId);
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

  async function handleSelectAvatar(id: number) {
    if (!user || savingAvatar) return;
    setSelectedAvatarId(id);
    setSavingAvatar(true);
    setAvatarSaved(false);
    try {
      await updateDoc(doc(db, "users", user.uid), { avatarId: id });
      setProfile((prev) => (prev ? { ...prev, avatarId: id } : prev));
      await refreshProfile();
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2000);
    } catch {
      setError("Could not save avatar. Please try again.");
      setSelectedAvatarId(profile?.avatarId ?? 1);
    } finally {
      setSavingAvatar(false);
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

          {/* Header with avatar */}
          <div className="flex items-center gap-4 mb-8">
            <UserAvatar
              avatarId={selectedAvatarId}
              size={72}
              className="ring-4 ring-amber-400 shadow-lg rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                @{profile.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {profile.email}
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 bg-red-100 dark:bg-red-950/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded"
            >
              {error}
            </div>
          )}

          {user ? (
            <div className="mb-8">
              <DailyQuizCard userId={user.uid} />
            </div>
          ) : null}

          {/* Avatar picker */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Poză de profil
              </h2>
              {avatarSaved && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Salvat!
                </span>
              )}
              {savingAvatar && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Se salvează...
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {AVATAR_IDS.map((id) => {
                const isSelected = id === selectedAvatarId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectAvatar(id)}
                    disabled={savingAvatar}
                    aria-label={`Avatar ${id}`}
                    aria-pressed={isSelected}
                    className={`relative rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed ${
                      isSelected
                        ? "ring-4 ring-amber-400 shadow-lg scale-110"
                        : "ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-500 hover:scale-105"
                    }`}
                  >
                    <UserAvatar avatarId={id} size={48} />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username edit */}
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
