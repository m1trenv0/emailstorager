# 🚀 Quick Start Guide

Get the Email Storage Manager up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection:

```env
# For local MongoDB:
DATABASE_URL="mongodb://localhost:27017/emailstorager"

# OR for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/emailstorager"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Initialize Database

```bash
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## First Steps

1. **Add an Account**: Click "Add New Account" button
2. **Add an Alias**: Select an account and click "Add Alias"
3. **Update Status**: Click status buttons to track service registration
4. **Add Comments**: Click "Edit Comment" to add notes

## Testing

Run tests to verify everything works:

```bash
npm test
```

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to MongoDB

**Solution**: 
- Verify MongoDB is running: `mongosh` (for local)
- Check DATABASE_URL format
- Ensure network access (for Atlas)

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: 
- Stop other processes on port 3000
- Or change port: `npm run dev -- -p 3001`

### Prisma Client Not Found

**Problem**: Cannot find Prisma Client

**Solution**: 
```bash
npx prisma generate
```

## Project Structure Overview

```
emailstorager/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── accounts/      # Account endpoints
│   │   └── aliases/       # Alias endpoints
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # Shadcn components
│   ├── AccountCard.tsx   # Account display
│   ├── AliasCard.tsx     # Alias display
│   └── StatusIcon.tsx    # Status icons
├── lib/                  # Core logic
│   ├── store/           # Zustand store
│   ├── business-logic.ts # Business rules
│   └── middleware.ts     # Security
└── __tests__/           # Jest tests
```

## Key Features

✅ **7-Day Limit**: Enforced waiting period between alias additions
✅ **Status Tracking**: Track AliExpress and Augment registrations
✅ **Comments**: Add notes to each alias
✅ **Security**: CSRF, rate limiting, input validation
✅ **Real-time Updates**: Zustand state management

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run format:check # Check formatting

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode

# Database
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Sync schema to database
npx prisma studio    # Open Prisma Studio
```

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review [PLAN.md](./PLAN.md) for project architecture
- Open an issue on GitHub

---

Happy coding! 🎉