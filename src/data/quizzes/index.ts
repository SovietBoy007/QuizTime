import { buildQuiz } from "./helpers";
import { validateQuizBank } from "./validate";
import { geografieRows } from "./geografie";
import { stiinteRows } from "./stiinte";
import { istorieRows } from "./istorie";
import { matematicaRows } from "./matematica";
import { informaticaRows } from "./informatica";
import { limbaRomanaRows } from "./limba-romana";
import type { Quiz } from "@/types/quiz";

export const SAMPLE_QUIZZES: Quiz[] = [
  buildQuiz(
    "geografie",
    "Geografie",
    "România, Europa și geografie generală — capitale, relief, climă, resurse și populație.",
    geografieRows
  ),
  buildQuiz(
    "stiinte",
    "Științe naturale",
    "Biologie, chimie și fizică: corpul uman, materie, energie și mediul înconjurător.",
    stiinteRows
  ),
  buildQuiz(
    "istorie",
    "Istorie și cultură",
    "Istoria României, personalități, evenimente și patrimoniu cultural.",
    istorieRows
  ),
  buildQuiz(
    "matematica",
    "Matematică",
    "Aritmetică, algebră, geometrie și raționament matematic pe trei niveluri școlare.",
    matematicaRows
  ),
  buildQuiz(
    "informatica",
    "Informatică",
    "Hardware, internet, algoritmi, programare și siguranță digitală.",
    informaticaRows
  ),
  buildQuiz(
    "limba-romana",
    "Limba română",
    "Ortografie, gramatică, vocabular, lectură și literatură română.",
    limbaRomanaRows
  ),
];

validateQuizBank(SAMPLE_QUIZZES);

export const QUIZ_TOPIC_IDS = SAMPLE_QUIZZES.map((q) => q.id);

/** Legacy Firestore document ids from earlier English quiz seeds. */
export const LEGACY_QUIZ_IDS = [
  "world-geography",
  "science-fundamentals",
  "tech-history",
];
