# Only4kiddos Family Event Discovery App

## Overview
A React Native Expo application for family event discovery, successfully imported and configured for the Replit environment. The app is a family-oriented event discovery platform built with Expo Router and modern React Native libraries.

## Recent Changes (2025-09-13)
- ✅ Fixed TypeScript/JSX configuration in tsconfig.json for proper React component rendering
- ✅ Set up Expo development server workflow using custom "rork" development tool
- ✅ Configured workflow to run on port 5000 with tunnel support for Replit proxy
- ✅ Verified successful application bundling and web accessibility
- ✅ Set up deployment configuration for autoscale production deployment

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
- ✅ Development server running on port 5000
- ✅ Web bundling successful (2680+ modules)  
- ✅ TypeScript compilation working
- ✅ Deployment configuration ready
- ✅ All workflows operational

## User Preferences
- Uses Bun as the primary package manager
- Prefers TypeScript with strict mode enabled
- Uses custom "rork" development server over standard Expo CLI

## Deployment Notes
- Configured for autoscale deployment
- Build process: `bun install`
- Run command: Custom rork server with tunnel support
- Port: 5000 (required for Replit)