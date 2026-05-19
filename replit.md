# Only4kiddos Family Event Discovery App

## Overview
A React Native Expo application for family event discovery, successfully imported and configured for the Replit environment. The app is a family-oriented event discovery platform built with Expo Router and modern React Native libraries.

## Recent Changes (2025-09-23)
- ✅ **PRODUCTION-READY SECURITY**: Added comprehensive security middleware stack
  - Rate limiting: 60 requests/minute per IP to prevent DoS attacks
  - Request logging middleware for monitoring and debugging
  - Enhanced body size limits (1MB) with Content-Length requirement to prevent bypass
  - Environment-driven CORS: denies all origins in production unless ALLOWED_ORIGINS set
- ✅ **ATOMIC BOOKING SYSTEM**: Implemented race condition prevention
  - Atomic spot reservation/release operations prevent overselling
  - Server-side validation using authenticated user context (no client trust)
  - Quantity validation and ownership checks in tRPC mutations
- ✅ **ACCESSIBILITY COMPONENTS**: Created production-ready UI components
  - EmptyState component with proper accessibility roles and descriptions
  - AccessiblePressable with 44px minimum touch targets and hitSlop
  - Image utility component for standardized usage patterns
- ✅ **DEVELOPMENT WORKFLOW**: Automated CI/CD pipeline setup
  - GitHub Actions workflow for automated typecheck and lint on pull requests
  - Prettier configuration for consistent code formatting
  - Clean codebase with unused mock files removed
- ✅ **BACKEND ARCHITECTURE**: Production-grade tRPC server
  - Fixed tRPC context integration for proper type safety
  - Clean separation of concerns in data layer
  - Both backend and frontend workflows running successfully

## Project Architecture

### Frontend (Expo React Native Web)
- **Framework**: Expo Router v5 with React Native Web
- **Language**: TypeScript with React 19
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand + TanStack Query
- **Navigation**: Expo Router with tab-based navigation

### Development Tools
- **Package Manager**: Bun
- **Development Server**: Custom "rork" CLI tool (bunx rork start)
- **Build System**: Metro bundler via Expo

### Key Dependencies
- React Navigation with gesture handling
- Expo modules (blur, image, location, symbols, etc.)
- Lucide React Native icons
- React Native Web for cross-platform compatibility

### Project Structure
```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation
│   ├── (home)/       # Home tab
│   ├── create/       # Create tab  
│   ├── profile/      # Profile tab
│   └── search/       # Search tab
├── event/            # Event detail pages
└── _layout.tsx       # Root layout

components/           # Reusable UI components
constants/           # Color scheme and constants
hooks/              # Custom React hooks
types/              # TypeScript type definitions
mocks/              # Mock data for development
```

## Current State  
- ✅ **PRODUCTION-READY:** App with comprehensive security and validation
- ✅ Backend tRPC server running with middleware stack (rate limiting, logging, CORS)
- ✅ Frontend Expo web server serving on port 5000
- ✅ Atomic booking system preventing overselling and race conditions
- ✅ Server-side validation and authentication guards
- ✅ Accessibility components and development workflow automation
- ✅ TypeScript configuration with skipLibCheck for clean builds
- ✅ Deployment configuration ready for production scaling

## User Preferences
- Uses Bun as the primary package manager
- Prefers TypeScript with strict mode enabled
- Uses custom "rork" development server over standard Expo CLI

## Deployment Notes
- Configured for autoscale deployment
- Build process: `bun install`
- Run command: Custom rork server with tunnel support
- Port: 5000 (required for Replit)