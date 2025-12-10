# Email Storage Manager

Self-hosted service for managing Outlook accounts and their aliases. Track when you can create new email addresses and monitor package deliveries using 17Track API.

## Features

- **Account Management**: Store email accounts with recovery credentials
- **Alias Management**: Add and manage email aliases (7-day cooldown between additions)
- **Package Tracking**: Track AliExpress deliveries directly on the site via 17Track API
- **Self-Hosted**: Your data stays on your server with MongoDB
- **Comments**: Add notes to each alias
- **Filters**: Custom filtering system for organizing accounts

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Installation

```bash
git clone <repository-url>
cd emailstorager
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB connection:

```env
DATABASE_URL="mongodb://localhost:27017/emailstorager"
```

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Testing

```bash
npm test
npm run test:watch
```

## Production

```bash
npm run build
npm start
```

## Project Structure

```
app/          # Next.js 15 app directory
  api/        # API routes
  auth/       # Authentication pages
components/   # React components
lib/          # Utils, store, business logic
prisma/       # Database schema
__tests__/    # Jest tests
```

## Tech Stack

- Next.js 15 + React 19
- TypeScript
- Prisma + MongoDB
- Zustand (state management)
- Shadcn UI + Tailwind
- Jest (testing)

## License

MIT
