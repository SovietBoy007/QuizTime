# QuizTime - Interactive Quiz Platform

A modern quiz application built with Next.js, TypeScript, and Firebase (Auth + Firestore).

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/SovietBoy007/QuizTime.git
cd QuizTime
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Server-side (API routes, seed script)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 4. Seed quizzes (optional)
```bash
npm run seed:quizzes
```
Requires `serviceAccount.json` in the project root (copy from `serviceAccount.json.example`).

### Firestore security rules
Rules live in `firestore.rules`.

**Option A — npm script (no global install):**
```bash
npm install
npm run deploy:rules
```
First run opens a browser to sign in with Google (`firebase login`).

**Option B — Firebase Console:**  
Firestore → Rules → paste `firestore.rules` → Publish.

If your Firebase project id is not `quiztime-b875d`, edit `.firebaserc` before deploying.

### 5. Run the project
```bash
npm run dev
```

Open: `http://localhost:3000`

## Project structure

```
quiztime/
├── src/
│   ├── app/
│   │   ├── api/              # Firestore-backed API routes
│   │   ├── quizzes/          # Quiz listing and play
│   │   ├── leaderboard/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   ├── data/quizzes/         # Quiz content source
│   └── lib/                  # Firebase & Firestore helpers
├── scripts/seed-quizzes.ts   # Seed Firestore from quiz data
└── package.json
```

## Useful commands

- `npm run dev` — start dev server
- `npm run build` — build for production (Vercel-ready)
- `npm run lint` — run ESLint
- `npm run seed:quizzes` — upload quizzes to Firestore

## Vercel deployment

1. Connect the repo to Vercel.
2. Add the same Firebase env vars from `.env.local` in the Vercel dashboard.
3. Deploy — no database migrations required; data lives in Firestore.

## Notes

- Keep `.env.local` out of Git.
- User auth and quiz results use Firebase Auth UID + Firestore collections (`users`, `quizzes`, `results`).

---

Made with ❤️ for QuizTime
