# Email Storage Manager

Open-source NextJS application for convenient storage and management of Outlook email accounts with alias management, featuring service status tracking for AliExpress and Augment.

## 🚀 Features

- **Account Management**: Store primary email accounts with recovery credentials
- **Alias Management**: Add and manage email aliases with 7-day addition limit
- **Service Status Tracking**: Track registration and delivery status for AliExpress and Augment
- **Secure Self-Hosted**: Keep your data private with MongoDB database
- **Comment System**: Add notes and comments to each alias
- **Tab-Based Interface**: Organized views for different service statuses
- **Real-time Updates**: Zustand state management for instant UI updates
- **Security First**: CSRF protection, rate limiting, input validation with Zod

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd emailstorager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```env
DATABASE_URL="mongodb://localhost:27017/emailstorager"
# or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/emailstorager"
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Run database migrations** (if using a fresh database)
```bash
npx prisma db push
```

## 🚀 Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🏗️ Build for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
emailstorager/
├── app/                      # NextJS 15 app directory
│   ├── api/                 # API routes
│   │   ├── accounts/        # Account management endpoints
│   │   └── aliases/         # Alias management endpoints
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application page
├── components/              # React components
│   ├── ui/                  # Shadcn-UI base components
│   ├── AccountCard.tsx      # Account display component
│   ├── AliasCard.tsx        # Alias display component
│   ├── StatusIcon.tsx       # Service status icon
│   └── AddAccountForm.tsx   # Account creation form
├── lib/                     # Utilities and configurations
│   ├── store/              # Zustand state management
│   ├── business-logic.ts   # Core business logic
│   ├── middleware.ts       # Security middleware
│   ├── prisma.ts           # Database connection
│   └── types.ts            # TypeScript types
├── prisma/                 # Database schema
│   └── schema.prisma
├── __tests__/              # Jest test files
└── public/                 # Static assets
```

## 🔐 Security Features

- **CSRF Protection**: Token-based protection for API routes
- **Rate Limiting**: In-memory rate limiting to prevent abuse
- **Input Validation**: Zod schemas for all API inputs
- **Secure Headers**: Helmet.js security headers
- **Type Safety**: Full TypeScript coverage

## 📊 Business Logic

### 7-Day Alias Addition Limit

The application enforces a 7-day waiting period between adding aliases to an account:

- First alias can be added immediately
- Subsequent aliases require 7 days wait from the last addition
- Timer display shows remaining time: "X days Y:Z"
- API prevents premature alias addition with clear error messages

## 🎨 Design System

The application uses Shadcn-UI with a consistent design system:

- **Colors**: Neutral base with semantic status colors
- **Typography**: Geist Sans font family
- **Components**: Reusable, accessible components
- **Dark Mode**: Automatic dark mode support
- **Responsive**: Mobile-first responsive design

## 🔧 Code Quality

- **ESLint**: Strict TypeScript and security rules
- **Prettier**: Consistent code formatting
- **Jest**: Comprehensive unit tests
- **TypeScript**: Full type safety

Run linting:
```bash
npm run lint
npm run lint:fix
```

Run formatting:
```bash
npm run format
npm run format:check
```

## 📝 API Endpoints

### Accounts

- `GET /api/accounts` - Fetch all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/[id]` - Fetch specific account
- `PATCH /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Aliases

- `GET /api/accounts/[id]/aliases` - Fetch account aliases
- `POST /api/accounts/[id]/aliases` - Create alias (7-day limit applies)
- `GET /api/aliases/[id]` - Fetch specific alias
- `PATCH /api/aliases/[id]` - Update alias status/comments
- `DELETE /api/aliases/[id]` - Delete alias

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is open-source and available under the MIT License.

## 🐛 Known Issues

- None currently reported

## 🚀 Future Enhancements

- Export/Import functionality
- Email notifications
- Advanced search and filtering
- Bulk operations
- Analytics dashboard

## 💬 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using Next.js 15, React 19, Prisma, MongoDB, and Zustand
