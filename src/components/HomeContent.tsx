"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col gap-3">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow">
        {step}
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-extrabold text-white">{value}</span>
      <span className="text-white/70 text-sm font-medium">{label}</span>
    </div>
  );
}

export default function HomeContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-slate-700 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32 text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm border border-white/15">
            <span>🎓</span> Quiz-uri interactive pentru toți
          </div>

          {/* Brand logo — sole identity mark in hero */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={theme === "dark" ? "/logoDark.png" : "/logoLight.png"}
            alt="QuizTime"
            style={{ height: "112px", width: "auto", display: "block" }}
          />

          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Rezolvă quiz-uri, câștigă XP și urmărește-ți progresul. Fie că înveți
            ceva nou sau vrei să-ți testezi cunoștințele, e un loc bun de început.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-base shadow-lg transition-colors"
                  >
                    Du-mă la Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-base shadow-lg transition-colors"
                    >
                      Creează un cont gratuit
                    </Link>
                    <Link
                      href="/login"
                      className="px-7 py-3 rounded-full bg-white/10 text-white font-semibold text-base hover:bg-white/20 border border-white/20 transition-colors"
                    >
                      Intru cu contul meu
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              href="/quizzes"
              className="px-7 py-3 rounded-full bg-white/8 text-white/80 font-semibold text-base hover:bg-white/15 border border-white/15 transition-colors"
            >
              Vezi quiz-urile
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-10 justify-center mt-10 pt-10 border-t border-white/10 w-full max-w-xl">
            <StatPill value="100+" label="Quiz-uri" />
            <StatPill value="XP" label="Puncte de progres" />
            <StatPill value="🔥" label="Streak zilnic" />
            <StatPill value="🏅" label="Insigne" />
          </div>
        </div>
      </section>

      {/* CE ESTE QUIZTIME */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Despre proiect
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Ce poți face pe QuizTime?
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            Un loc unde rezolvi quiz-uri, acumulezi XP și te compari cu alții.
            Poți juca oricând sau să prinzi quizul zilnic, disponibil pentru
            toată lumea în același timp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon="📚"
            title="Quiz-uri pe diferite teme"
            description="Matematică, știință, cultură generală, programare. Alegi ce vrei și rezolvi în ritmul tău."
          />
          <FeatureCard
            icon="⚡"
            title="Puncte XP"
            description="Fiecare răspuns corect adaugă XP la profilul tău. Cu cât completezi mai multe quiz-uri, cu atât nivelul crește."
          />
          <FeatureCard
            icon="🔥"
            title="Streak zilnic"
            description="Dacă joci în fiecare zi, streak-ul tău crește. E o modalitate simplă de a rămâne constant."
          />
          <FeatureCard
            icon="🏅"
            title="Insigne"
            description="La anumite realizări primești insigne, afișate pe profilul tău. Unele sunt mai rare decât altele."
          />
          <FeatureCard
            icon="🏆"
            title="Clasament"
            description="Jucătorii sunt ordonați după XP total. Poți vedea cine e în top și unde ești tu față de ceilalți."
          />
          <FeatureCard
            icon="📅"
            title="Quiz zilnic"
            description="În fiecare zi e disponibil un quiz nou pentru toți. Aceleași întrebări, același timp. E fair pentru toată lumea."
          />
        </div>
      </section>

      {/* CUM FUNCTIONEAZA */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Patru pași
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Cum funcționează?
            </h2>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col gap-8">
            <StepCard
              step={1}
              icon="👤"
              title="Îți faci un cont"
              description="Înregistrare rapidă, fără complicații. Alegi un username și ești gata de joc."
            />
            <StepCard
              step={2}
              icon="🎯"
              title="Alegi un quiz"
              description="Răsfoiești colecția sau intri direct la quizul zilnic. Poți filtra după subiect sau dificultate."
            />
            <StepCard
              step={3}
              icon="⚡"
              title="Primești XP"
              description="Răspunsurile corecte îți aduc XP. Dacă termini un quiz fără greșeli, primești și bonus. Unele quiz-uri deblochează insigne."
            />
            <StepCard
              step={4}
              icon="🔥"
              title="Revii a doua zi"
              description="Streak-ul zilnic îți adaugă XP bonus. Cu cât ești mai constant, cu atât crești mai repede în clasament."
            />
          </div>
        </div>
      </section>

      {/* GAMIFICATION DETAILS */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Progres
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Cum funcționează progresul?
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-base">
            Câteva mecanisme simple care fac platforma mai interesantă de folosit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-6 flex flex-col gap-3">
            <div className="text-4xl">⚡</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">XP și niveluri</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Câștigi XP la fiecare răspuns corect. Dacă termini un quiz fără
              greșeli, primești bonus. Nivelul tău e vizibil pe profil și în
              clasament.
            </p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ XP per răspuns corect</li>
              <li>✓ Bonus la quiz perfect</li>
              <li>✓ Bonus din streak activ</li>
              <li>✓ Nivel vizibil pe profil</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-orange-100 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30 p-6 flex flex-col gap-3">
            <div className="text-4xl">🔥</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Streak zilnic</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Dacă joci cel puțin un quiz pe zi, streak-ul crește. Dacă sari o
              zi, se resetează. Cu streak activ, câștigi mai mult XP.
            </p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ Pornește din prima zi</li>
              <li>✓ Crește XP-ul câștigat</li>
              <li>✓ Apare pe profilul tău</li>
              <li>✓ Insigne speciale pentru streak lung</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-100 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/30 p-6 flex flex-col gap-3">
            <div className="text-4xl">🏅</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Insigne</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Anumite acțiuni deblochează insigne: prima completare, streak de
              7 zile, quiz perfect și altele. Le poți vedea pe profilul tău.
            </p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ La prima completare</li>
              <li>✓ Pentru streak activ</li>
              <li>✓ Pentru performanță</li>
              <li>✓ Câteva mai rare</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-100 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 p-6 flex flex-col gap-3">
            <div className="text-4xl">🏆</div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Clasament</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Toți jucătorii sunt ordonați după XP. Poți vedea streak-ul și
              nivelul fiecăruia. Clasamentul se actualizează automat.
            </p>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ Ordonat după XP total</li>
              <li>✓ Afișează streak și nivel</li>
              <li>✓ Profil public</li>
              <li>✓ Actualizat în timp real</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DAILY QUIZ HIGHLIGHT */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 py-20">
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-6">
          <div className="text-5xl">📅</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Quiz-ul zilnic
          </h2>
          <p className="text-white/80 text-lg max-w-xl leading-relaxed">
            Zilnic apare un set nou de întrebări, disponibil pentru toată lumea.
            Toți primesc aceleași întrebări în aceeași zi, nimeni nu are
            avantaj. Contează și streak-ul, nu doar scorul.
          </p>
          <Link
            href="/daily"
            className="px-8 py-3 rounded-full bg-white text-blue-700 font-bold text-base hover:bg-blue-50 shadow-lg transition-colors"
          >
            Rezolvă quiz-ul de azi
          </Link>
        </div>
      </section>

      {/* CTA FINAL */}
      {!loading && !user && (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Vrei să încerci?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Contul e gratuit. Poți începe să joci imediat.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-base hover:opacity-90 shadow-lg transition"
              >
                Creează un cont
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold text-base border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Am deja cont
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span className="font-semibold text-gray-600 dark:text-gray-400">
            🎯 QuizTime
          </span>
          <span>Quiz-uri interactive · {new Date().getFullYear()}</span>
          <div className="flex gap-4">
            <Link href="/quizzes" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Quizuri
            </Link>
            <Link href="/leaderboard" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Clasament
            </Link>
            <Link href="/badges" className="hover:text-gray-700 dark:hover:text-gray-300 transition">
              Insigne
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
