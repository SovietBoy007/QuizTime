"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UserProfile {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  stats: {
    totalQuizzes: number;
    averageScore: number;
    totalPoints: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    avatar: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          avatar: data.user.avatar || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (profile) {
          setProfile({
            ...profile,
            user: { ...profile.user, ...data },
          });
        }
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  if (status === "loading" || loading) {
    return <div className="text-center py-12">Se încarcă profil...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">Nu s-a putut încărca profilul.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            👤 Profilul Meu
          </h1>

          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            {profile.user.avatar && (
              <img
                src={profile.user.avatar}
                alt={profile.user.username}
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profile.user.firstName} {profile.user.lastName}
              </h2>
              <p className="text-gray-600">@{profile.user.username}</p>
              <p className="text-gray-500">{profile.user.email}</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Quizuri Rezolvate</p>
              <p className="text-2xl font-bold text-blue-600">
                {profile.stats.totalQuizzes}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Scor Mediu</p>
              <p className="text-2xl font-bold text-green-600">
                {Number(profile.stats.averageScore).toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total Puncte</p>
              <p className="text-2xl font-bold text-purple-600">
                {profile.stats.totalPoints}
              </p>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="border-t pt-8">
            {editing ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Editează Profilul</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prenume
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData({ ...formData, avatar: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave}>Salvează</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                  >
                    Anulează
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setEditing(true)}>
                Editează Profil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
