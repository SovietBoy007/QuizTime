# QuizTime - Interactive Quiz Platform 🎯

A modern, feature-rich quiz application built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Features

✨ **Core Features:**
- 👤 User Authentication & Registration
- 📚 Quiz Creation & Management
- ❓ Multiple Quiz Types (Multiple Choice, True/False, Short Answer)
- 🎯 Quiz Taker with Real-time Scoring
- 🏆 Global Leaderboard
- 📊 User Statistics & History
- 👨‍💻 User Profiles
- 🌈 Modern, Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Security:** bcryptjs for password hashing

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- Git

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd quiztime
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/quiztime"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-change-in-production"
```

4. **Initialize the database**
```bash
npx prisma migrate dev --name init
```

This will create all the necessary database tables.

5. **Generate Prisma Client**
```bash
npx prisma generate
```

## Running the Application

**Development mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Production build:**
```bash
npm run build
npm run start
```

## Database Schema

The application uses the following main entities:

- **User** - User accounts and profiles
- **Quiz** - Quiz information and metadata
- **Question** - Questions within a quiz
- **Answer** - Possible answers for questions
- **Score** - User scores and quiz results
- **UserAnswer** - User's answers to questions
- **ChatMessage** - Messages for AI chat helper

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/[id]` - Get specific quiz

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Submit quiz and save score

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Project Structure

```
quiztime/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── auth/             # Auth pages
│   │   ├── quizzes/          # Quiz pages
│   │   ├── leaderboard/      # Leaderboard page
│   │   ├── profile/          # Profile page
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation
│   │   └── ui/               # UI components
│   └── lib/
│       └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── .env.local                # Environment variables
└── package.json
```

## Future Enhancements

- 🤖 AI Chat Helper for quiz explanations
- 📱 Mobile app
- 🎨 Quiz customization options
- 👥 Multiplayer quiz battles
- 🏅 Badges and achievements
- 📧 Email notifications
- 🔍 Advanced search and filtering
- 📈 Analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please create an issue on GitHub.

---

Made with ❤️ by QuizTime Team
