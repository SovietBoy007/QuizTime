import {
  LEVEL_LABELS,
  LEVEL_STYLES,
  getQuestionCountsByLevel,
} from "@/lib/quiz-levels";
import { getSessionRangeLabel } from "@/lib/quiz-session";
import type { Quiz, SchoolLevel } from "@/types/quiz";

type LevelSelectorProps = {
  quiz: Quiz;
  onSelect: (level: SchoolLevel) => void;
};

export default function LevelSelector({ quiz, onSelect }: LevelSelectorProps) {
  const poolCounts = getQuestionCountsByLevel(quiz.questions);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        Alege nivelul
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
        La fiecare sesiune primești un număr aleator de întrebări din banca
        subiectului, fără repetări în aceeași rundă.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["primar", "gimnazial", "liceu"] as SchoolLevel[]).map((level) => {
          const poolSize = poolCounts[level];
          const disabled = poolSize === 0;
          const sessionRange = getSessionRangeLabel(level);

          return (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(level)}
              className={`flex flex-col items-center rounded-2xl border-2 p-6 text-center transition-all ${
                disabled
                  ? "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                  : "border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-lg cursor-pointer"
              }`}
            >
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium mb-3 ${LEVEL_STYLES[level]}`}
              >
                {LEVEL_LABELS[level]}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {sessionRange} întrebări / sesiune
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bancă: {poolSize} {poolSize === 1 ? "întrebare" : "întrebări"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        Nivel primar · gimnazial · liceu
      </p>
    </div>
  );
}
