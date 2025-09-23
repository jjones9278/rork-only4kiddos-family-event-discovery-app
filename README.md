# Only4kiddos Family Event Discovery App

A React Native Expo application for family event discovery with a comprehensive, production-ready backend architecture featuring secure tRPC API, Firebase authentication, integrated Stripe payment processing, Google Maps for event locations, and server-side MailerLite email marketing.

## Features

- 🎉 **Event Discovery**: Browse and search family-friendly events
- 👶 **Child Management**: Add and manage multiple children profiles
- ❤️ **Favorites**: Save events for quick access
- 🎫 **Event Booking**: Book events with secure payment processing
- 🗺️ **Maps Integration**: View event locations with Google Maps
- 📧 **Email Subscriptions**: Newsletter signup with MailerLite integration
- 🔐 **Authentication**: Secure Firebase authentication
- 💳 **Payments**: Stripe integration for event bookings

## Architecture

### Frontend (Expo React Native Web)
- **Framework**: Expo Router v5 with React Native Web
- **Language**: TypeScript with React 19
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query + tRPC
- **Navigation**: Expo Router with tab-based navigation

### Backend (Hono + tRPC)
- **API**: Type-safe tRPC with Zod schema validation
- **Authentication**: Firebase Admin with secure token verification
- **Email Marketing**: Server-side MailerLite integration
- **Data Store**: Centralized in-memory store (easily swappable with database)
- **Security**: Environment-driven CORS, protected procedures

## Environment Setup

Create a `.env` file in the root directory with the following variables (see `.env.example` for reference):

### Frontend Variables (EXPO_PUBLIC_ prefix)
```bash
# Firebase Client Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Stripe Public Key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-public-key

# Google Maps API Keys (Platform-specific)
GOOGLE_MAPS_ANDROID_API_KEY=your-google-maps-android-key
GOOGLE_MAPS_IOS_API_KEY=your-google-maps-ios-key
```

### Backend Variables (NO EXPO_PUBLIC_ prefix)
```bash
# Firebase Admin (required for production)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"

# MailerLite API (backend-only)
MAILERLITE_API_KEY=your-mailerlite-api-key

# Stripe Secret Key (backend-only)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Production CORS configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Run Locally

### Prerequisites
- Node.js 18+ or Bun runtime
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project with Authentication enabled
- MailerLite account and API key
- Stripe account (for payments)

### Development Setup

1. **Install Dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Start Backend Server**
   ```bash
   bun run dev:server
   # or
   npm run dev:server
   ```
   The backend runs on `http://localhost:3001`

3. **Start Expo Development Server**
   ```bash
   npx expo start
   # or
   npm start
   ```
   The app runs on `http://localhost:5000` (web)

4. **Run Both Simultaneously**
   ```bash
   bun run dev:all
   # or
   npm run dev:all
   ```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run dev:server` - Start backend tRPC server
- `npm run dev:all` - Run both backend and frontend concurrently
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run build:web` - Build for web production
- `npm run start:prod` - Serve production build

## Authentication Flow

The app uses Firebase Authentication with a secure backend verification system:

1. **Client Authentication**: Users sign in through Firebase Auth on the frontend
2. **Token Attachment**: `lib/trpc.ts` automatically attaches Firebase Bearer tokens to all API requests
3. **Backend Verification**: `backend/middleware/auth.ts` verifies tokens using Firebase Admin SDK
4. **Protected Routes**: tRPC procedures are protected and require valid authentication

## API Architecture

### tRPC Endpoints

- **Events**: `trpc.events.list`, `trpc.events.byId` - Event discovery and details
- **Favorites**: `trpc.favorites.toggle`, `trpc.favorites.list` - Favorite management
- **Children**: `trpc.children.list`, `trpc.children.create` - Child profile management
- **Bookings**: `trpc.bookings.create`, `trpc.bookings.list` - Event booking system
- **MailerLite**: `trpc.mailerlite.subscribe` - Secure email subscription

### Security Features

- 🔒 **No Client-Side API Keys**: All sensitive keys (MailerLite, Stripe Secret) are backend-only
- 🛡️ **Firebase Admin Verification**: Production-grade token verification with service accounts
- 🌐 **Environment-Driven CORS**: Configurable origins for production security
- ✅ **Zod Validation**: All API inputs validated with TypeScript schemas
- 🔐 **Protected Procedures**: Authentication required for sensitive operations

## Project Structure

```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation
│   ├── (home)/       # Home tab with event discovery
│   ├── profile/      # User profile and children management
│   └── search/       # Event search functionality
├── event/            # Event detail pages
└── _layout.tsx       # Root layout with providers

backend/               # Secure backend services
├── middleware/       # Authentication and validation
├── trpc/            # Type-safe API routes
├── services/        # External API integrations (MailerLite)
└── store/           # Centralized data management

components/           # Reusable UI components
├── LoadingState.tsx # Consistent loading indicators
├── ErrorState.tsx   # Error handling with retry
├── ToastProvider.tsx # Success/error notifications
└── EventCard.tsx    # Event display components

hooks/               # React Query + tRPC integration
└── use-events-trpc.ts # Type-safe data fetching hooks

types/               # Shared TypeScript schemas
└── schemas.ts       # Zod schemas for API validation
```

## Development Notes

- **Type Safety**: Full TypeScript coverage with tRPC providing end-to-end type safety
- **State Management**: TanStack Query handles caching, optimistic updates, and synchronization
- **Error Handling**: Comprehensive error boundaries with user-friendly messages
- **Loading States**: Professional loading indicators throughout the app
- **Toast Notifications**: Success/error feedback for all user actions

## Deployment

The app is configured for production deployment with:

- **Environment-driven configuration**: Separate dev/prod settings
- **Secure authentication**: Firebase Admin service account for production
- **CORS security**: Configurable allowed origins
- **Build optimization**: Expo web build for static hosting
- **Backend deployment**: Hono server ready for serverless or traditional hosting

For production deployment, ensure all environment variables are properly configured and Firebase Admin service account credentials are provided.
