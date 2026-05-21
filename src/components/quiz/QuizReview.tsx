"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Quiz, QuestionResponse } from "@/types/quiz";
import ReviewQuestionCard from "./ReviewQuestionCard";

type ReviewItem = {
  question: Quiz["questions"][number];
  selectedAnswerId: string;
};

type QuizReviewProps = {
  quiz: Quiz;
  responses: QuestionResponse[];
  onExit: () => void;
};

function buildReviewItems(
  quiz: Quiz,
  responses: QuestionResponse[]
): ReviewItem[] {
  const responseByQuestion = new Map(
    responses.map((r) => [r.questionId, r])
  );

  return quiz.questions
    .map((question) => {
      const response = responseByQuestion.get(question.id);
      if (!response || response.isCorrect) return null;
      return {
        question,
        selectedAnswerId: response.selectedAnswerId,
      };
    })
    .filter((item): item is ReviewItem => item !== null);
}

export default function QuizReview({
  quiz,
  responses,
  onExit,
}: QuizReviewProps) {
  const items = useMemo(
    () => buildReviewItems(quiz, responses),
    [quiz, responses]
  );
  const [index, setIndex] = useState(0);

  const current = items[index];
  const total = items.length;

  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You answered every question correctly — nothing to review.
        </p>
        <Button size="lg" variant="secondary" onClick={onExit}>
          Back to Results
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Review Mistakes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {quiz.title} · {total} incorrect{" "}
          {total === 1 ? "question" : "questions"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {index + 1} of {total}
        </p>
        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden max-w-xs ml-auto">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {current && (
        <ReviewQuestionCard
          question={current.question}
          questionNumber={index + 1}
          selectedAnswerId={current.selectedAnswerId}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button
          size="lg"
          variant="secondary"
          onClick={onExit}
          className="sm:order-first"
        >
          Back to Results
        </Button>

        <div className="flex gap-3 sm:ml-auto">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            Previous
          </Button>
          <Button
            size="lg"
            onClick={() =>
              index < total - 1
                ? setIndex((i) => i + 1)
                : onExit()
            }
          >
            {index < total - 1 ? "Next" : "Done"}
          </Button>
        </div>
      </div>
    </div>
  );
}
