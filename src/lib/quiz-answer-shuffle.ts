import type { QuizAnswer, QuizQuestion } from "@/types/quiz";

const OPTION_IDS = ["a", "b", "c", "d"] as const;
const DISPLAY_LABELS = ["A", "B", "C", "D"];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles answer order and reassigns ids a–d so the correct option
 * appears at a random position (not always display slot A).
 */
export function randomizeQuestionAnswers(question: QuizQuestion): QuizQuestion {
  const correct = question.answers.find(
    (a) => a.id === question.correctAnswerId
  );
  if (!correct || question.answers.length < 2) {
    return question;
  }

  const shuffledPool = shuffle(question.answers);
  const answers: QuizAnswer[] = shuffledPool.map((ans, index) => ({
    id: OPTION_IDS[index] ?? `opt-${index}`,
    text: ans.text,
  }));

  const correctIndex = shuffledPool.findIndex(
    (a) => a.id === question.correctAnswerId
  );
  const correctAnswerId =
    answers[correctIndex >= 0 ? correctIndex : 0]?.id ?? question.correctAnswerId;

  const prepared = {
    ...question,
    answers,
    correctAnswerId,
  };

  if (process.env.NODE_ENV === "development") {
    const displayIndex = answers.findIndex((a) => a.id === correctAnswerId);
    console.debug("[QuizTime] question options", {
      questionId: question.id,
      correctAnswerId,
      displayLabel: DISPLAY_LABELS[displayIndex] ?? "?",
      displayIndex,
      options: answers.map((a, i) => ({
        label: DISPLAY_LABELS[i],
        id: a.id,
        text: a.text.slice(0, 40),
      })),
    });
  }

  return prepared;
}
