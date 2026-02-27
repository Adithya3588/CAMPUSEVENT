# Campus Event Hub - Frontend

A React-based frontend for managing campus events, built with Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Firebase** - Authentication & Database
- **React Router** - Routing
- **React Query** - Data Fetching

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth)
├── hooks/           # Custom React hooks
├── lib/             # Utilities and Firebase config
├── pages/           # Page components
├── services/        # API service functions
└── test/            # Test files
```

## Features

- **Student Dashboard**: View and register for campus events
- **Admin Dashboard**: Create, edit, and manage events
- **Authentication**: Firebase-based login/register
- **Event Registration**: Track student registrations per event
