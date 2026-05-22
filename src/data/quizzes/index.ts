import { buildQuiz } from "./helpers";
import { validateQuizBank } from "./validate";
import { geografieRows } from "./geografie";
import { stiinteRows } from "./stiinte";
import { istorieRows } from "./istorie";
import { matematicaRows } from "./matematica";
import { informaticaRows } from "./informatica";
import { limbaRomanaRows } from "./limba-romana";
import { culturaGeneralaRows } from "./cultura-generala";
import { tariSiSteaguriRows } from "./tari-si-steaguri";
import { animaleRows } from "./animale";
import { trueFalseRows } from "./true-false";
import { mixedChallengeRows } from "./mixed-challenge";
import { popCultureRows } from "./pop-culture";
import type { Quiz } from "@/types/quiz";

export const SCHOOL_QUIZZES: Quiz[] = [
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

export const GENERAL_QUIZZES: Quiz[] = [
  buildQuiz(
    "cultura-generala",
    "Cultură generală",
    "Știință, artă, geografie, istorie și curiozități din lumea întreagă.",
    culturaGeneralaRows
  ),
  buildQuiz(
    "tari-si-steaguri",
    "Țări și steaguri",
    "Capitale, steaguri, continente și curiozități despre statele lumii.",
    tariSiSteaguriRows
  ),
  buildQuiz(
    "animale",
    "Animale",
    "Comportament animal, biodiversitate, ecologie și curiozități din regnul animal.",
    animaleRows
  ),
  buildQuiz(
    "true-false",
    "Adevărat sau Fals",
    "Testează-ți intuiția! Afirmații surprinzătoare despre știință, natură și lume.",
    trueFalseRows
  ),
  buildQuiz(
    "mixed-challenge",
    "Mixed Challenge",
    "O provocare diversă: știință, sport, artă, filozofie și tehnologie, amestecate.",
    mixedChallengeRows
  ),
  buildQuiz(
    "pop-culture",
    "Pop Culture",
    "Filme, muzică, seriale, jocuri video și fenomene din cultura populară modernă.",
    popCultureRows
  ),
];

export const SAMPLE_QUIZZES: Quiz[] = [...SCHOOL_QUIZZES, ...GENERAL_QUIZZES];

validateQuizBank(SAMPLE_QUIZZES);

export const QUIZ_TOPIC_IDS = SAMPLE_QUIZZES.map((q) => q.id);

export const SCHOOL_QUIZ_IDS = SCHOOL_QUIZZES.map((q) => q.id);
export const GENERAL_QUIZ_IDS = GENERAL_QUIZZES.map((q) => q.id);

/** Legacy Firestore document ids from earlier English quiz seeds. */
export const LEGACY_QUIZ_IDS = [
  "world-geography",
  "science-fundamentals",
  "tech-history",
];
