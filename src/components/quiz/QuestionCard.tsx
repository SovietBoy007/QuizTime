import type { QuizQuestion } from "@/types/quiz";

const ANSWER_LABELS = ["A", "B", "C", "D"];

type QuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  selectedAnswerId: string | null;
  showFeedback: boolean;
  onSelectAnswer: (answerId: string) => void;
};

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswerId,
  showFeedback,
  onSelectAnswer,
}: QuestionCardProps) {
  const isCorrectSelection =
    selectedAnswerId === question.correctAnswerId;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
          Întrebarea {questionNumber}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
          {question.question}
        </h2>
      </div>

      <div className="p-6 grid gap-3">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswerId === answer.id;
          const isCorrect = answer.id === question.correctAnswerId;
          const showAsCorrect = showFeedback && isCorrect;
          const showAsWrong = showFeedback && isSelected && !isCorrect;

          let buttonClass =
            "w-full flex items-start gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 ";

          if (showFeedback) {
            if (showAsCorrect) {
              buttonClass +=
                "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-100";
            } else if (showAsWrong) {
              buttonClass +=
                "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100";
            } else {
              buttonClass +=
                "border-gray-200 dark:border-gray-700 opacity-60 cursor-default";
            }
          } else if (isSelected) {
            buttonClass +=
              "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-gray-900 dark:text-gray-100 ring-2 ring-blue-500/30";
          } else {
            buttonClass +=
              "border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:shadow-md cursor-pointer";
          }

          return (
            <button
              key={answer.id}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelectAnswer(answer.id)}
              className={buttonClass}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  showAsCorrect
                    ? "bg-green-500 text-white"
                    : showAsWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {ANSWER_LABELS[index]}
              </span>
              <span className="pt-0.5">{answer.text}</span>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div
          className={`mx-6 mb-6 rounded-xl border px-5 py-4 ${
            isCorrectSelection
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          }`}
        >
          <p
            className={`font-semibold mb-2 ${
              isCorrectSelection
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrectSelection ? "✓ Corect!" : "✗ Greșit"}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
