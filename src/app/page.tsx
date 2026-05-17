import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          🎯 QuizTime
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Testează-ți cunoștințele cu quizuri interactive, concurează cu alții și
          îmbunătățește-ți abilitățile!
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          {session?.user ? (
            <>
              <Link href="/quizzes">
                <Button size="lg" className="text-lg">
                  Începe un Quiz
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="lg" variant="secondary" className="text-lg">
                  Profilul Meu
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="text-lg">
                  Înregistrează-te Acum
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Caracteristici Principale
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Mii de Quizuri
            </h3>
            <p className="text-gray-600">
              Accesează o colecție vastă de quizuri pe diferite subiecte și niveluri de dificultate.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Clasament Global
            </h3>
            <p className="text-gray-600">
              Concurează cu alți utilizatori și ocupă locul tău pe clasament.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              Statistici Detaliate
            </h3>
            <p className="text-gray-600">
              Urmărește progresul tău cu statistici complete și analize detailate.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session?.user && (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">
              Gata să Începi?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Înregistrează-te gratuit și accesează sute de quizuri astazi!
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Înregistrează-te Acum
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
