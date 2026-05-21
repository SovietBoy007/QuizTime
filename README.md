# QuizTime - Interactive Quiz Platform 🎯

A modern quiz application built with Next.js, TypeScript, PostgreSQL, and Prisma.

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
Create a `.env.local` file in the project root with your secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quiztime"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"
```

### 4. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the project
```bash
npm run dev
```

Open: `http://localhost:3000`

## How to continue on another device

1. Install `Git` and `Node.js` on the other device.
2. Clone the repo:
```bash
git clone https://github.com/SovietBoy007/QuizTime.git
cd QuizTime
```
3. Install dependencies:
```bash
npm install
```
4. Create your own `.env.local` with the correct values.
5. Run the app:
```bash
npm run dev
```

## Save your work to GitHub

When you finish work locally, run:
```bash
git add .
git commit -m "Save latest QuizTime progress"
git push origin main
```

Then on another device:
```bash
git pull origin main
npm install
```

## Project structure

```
quiztime/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Auth and login pages
│   │   ├── quizzes/          # Quiz listing and detail pages
│   │   ├── leaderboard/      # Leaderboard page
│   │   ├── profile/          # Profile page
│   │   └── page.tsx          # Home page
│   ├── components/           # Shared components
│   └── lib/                  # Utilities and helpers
├── prisma/                   # Prisma schema and migrations
├── public/                   # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Useful commands

- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run lint` — run ESLint
- `npx prisma migrate dev` — apply DB migrations
- `npx prisma studio` — open Prisma admin UI

## Notes

- Keep `.env.local` out of GitHub.
- Use `git push origin main` to save your work.
- Use `git pull origin main` on another device to get the latest changes.

---

Made with ❤️ for QuizTime
