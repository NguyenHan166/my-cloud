# Personal Cloud Storage - Frontend

React + TypeScript + Vite frontend for Personal Cloud Storage application.

## Tech Stack

-   **Framework**: React 18 with TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Routing**: React Router v6
-   **State Management**: React Context + React Query
-   **HTTP Client**: Axios
-   **Icons**: Lucide React
-   **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

-   Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── layout/          # Layout components
│   │   └── ProtectedRoute.tsx
│   └── library/         # Feature-specific components
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
├── lib/
│   ├── api/           # API client and endpoints
│   │   ├── client.ts
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── items.ts
│   │       └── files.ts
│   └── utils/         # Utility functions
│       ├── cn.ts      # Class name utility
│       └── format.ts  # Formatting utilities
├── pages/             # Route pages
│   ├── auth/
│   │   └── LoginPage.tsx
│   └── library/
│       └── LibraryPage.tsx
├── types/            # TypeScript types
│   ├── domain.ts     # Domain models
│   └── api.ts        # API types
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Features Implemented

### ✅ Base Infrastructure

-   Vite + React + TypeScript setup
-   Tailwind CSS with custom design system
-   Path aliases (@/_ → src/_)
-   API proxy configuration
-   Environment variables

### ✅ UI Components

-   Button (variants, sizes, loading state, icons)
-   Input (label, error, helper text, icons)
-   Modal (responsive, accessible, animations)
-   Badge (for tags and status)
-   Card (with hover effects)
-   Skeleton (loading states)
-   EmptyState (empty screens)
-   ErrorState (error handling)

### ✅ Authentication

-   Auth context with login/logout
-   Protected routes
-   Token management (access + refresh)
-   Auto token refresh on 401
-   Login page with form validation

### ✅ API Integration

-   Axios client with interceptors
-   Auth endpoints (login, register, logout, forgot password)
-   Items endpoints (CRUD, search)
-   Files endpoints (upload with progress, download, delete)

## Next Steps

See `SYSTEM_DESIGN.md` for the full feature roadmap. Priority items:

1. **Layout Components**

    - Main layout with sidebar
    - Navigation structure
    - Header with search

2. **Library Features**

    - Item cards/list components
    - File upload interface
    - Collections management
    - Tags system

3. **Advanced Features**
    - AI semantic search
    - Share links
    - Collections
    - File preview

## Design Principles

All components follow the UI/UX guidelines in `UXUI.md`:

-   Modern, clean, minimalist design
-   Fully responsive (mobile, tablet, desktop)
-   All 4 UI states (loading, empty, error, normal)
-   Accessible (ARIA labels, keyboard navigation)
-   Smooth animations (200-300ms)
-   Toast notifications (no browser alerts)

## Backend Integration

The frontend is configured to connect to the NestJS backend at `http://localhost:3000/api` (configurable via environment variables).

Ensure the backend is running before starting the frontend:

```bash
cd ../server
npm run start:dev
```
