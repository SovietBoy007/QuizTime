"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: { id: string }[];
  author: { username: string };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty]);

  async function fetchQuizzes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      const response = await fetch(`/api/quizzes?${params}`);
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          🎯 Quizuri Disponibile
        </h1>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate Categoriile</option>
            <option value="general">Generalități</option>
            <option value="science">Știință</option>
            <option value="history">Istorie</option>
            <option value="geography">Geografie</option>
            <option value="technology">Tehnologie</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toate Nivelurile</option>
            <option value="easy">Ușor</option>
            <option value="medium">Mediu</option>
            <option value="hard">Greu</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Se încarcă quizurile...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nu s-au găsit quizuri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-4 min-h-10">
                    {quiz.description}
                  </p>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {quiz.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        quiz.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : quiz.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    {quiz.questions.length} întrebări
                  </p>

                  <p className="text-sm text-gray-500 mb-4">
                    Autor: {quiz.author.username}
                  </p>

                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button size="lg" className="w-full">
                      Start Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
