import type { Quiz, SchoolLevel } from "@/types/quiz";

const LEVELS: SchoolLevel[] = ["primar", "gimnazial", "liceu"];
const MIN_PER_LEVEL = 20;

export function validateQuizBank(quizzes: Quiz[]): void {
  const errors: string[] = [];

  for (const quiz of quizzes) {
    for (const level of LEVELS) {
      const count = quiz.questions.filter((q) => q.level === level).length;
      if (count < MIN_PER_LEVEL) {
        errors.push(
          `${quiz.id}: nivel „${level}” are ${count} întrebări (minim ${MIN_PER_LEVEL}).`
        );
      }
    }

    const ids = new Set<string>();
    for (const q of quiz.questions) {
      if (ids.has(q.id)) {
        errors.push(`${quiz.id}: id duplicat „${q.id}”.`);
      }
      ids.add(q.id);

      if (q.topic !== quiz.category) {
        errors.push(`${quiz.id}: întrebarea „${q.id}” are topic „${q.topic}” incorect.`);
      }
      if (q.answers.length !== 4) {
        errors.push(`${quiz.id}: întrebarea „${q.id}” nu are 4 opțiuni.`);
      }
      if (!q.answers.some((a) => a.id === q.correctAnswerId)) {
        errors.push(`${quiz.id}: răspuns corect invalid la „${q.id}”.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validare quiz-uri eșuată:\n${errors.join("\n")}`);
  }
}
