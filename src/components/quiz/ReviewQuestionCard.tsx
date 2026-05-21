import type { QuizQuestion } from "@/types/quiz";

const ANSWER_LABELS = ["A", "B", "C", "D"];

type ReviewQuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  selectedAnswerId: string;
};

function getAnswerLabel(
  question: QuizQuestion,
  answerId: string
): { label: string; text: string } | null {
  const index = question.answers.findIndex((a) => a.id === answerId);
  if (index === -1) return null;
  return {
    label: ANSWER_LABELS[index],
    text: question.answers[index].text,
  };
}

export default function ReviewQuestionCard({
  question,
  questionNumber,
  selectedAnswerId,
}: ReviewQuestionCardProps) {
  const selected = getAnswerLabel(question, selectedAnswerId);
  const correct = getAnswerLabel(question, question.correctAnswerId);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Question {questionNumber}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
          {question.question}
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-1">
            Your answer
          </p>
          {selected ? (
            <p className="text-gray-900 dark:text-gray-100">
              <span className="font-bold text-red-700 dark:text-red-300 mr-2">
                {selected.label}.
              </span>
              {selected.text}
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No answer recorded.
            </p>
          )}
        </div>

        <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
            Correct answer
          </p>
          {correct ? (
            <p className="text-gray-900 dark:text-gray-100">
              <span className="font-bold text-green-700 dark:text-green-300 mr-2">
                {correct.label}.
              </span>
              {correct.text}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Explanation
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {question.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
