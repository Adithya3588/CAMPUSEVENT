# Campus Event Hub

A full-stack web application for managing campus events, allowing students to discover and register for events, and administrators to create and manage events.

## Project Structure

```
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/       # Firebase config
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   └── index.js      # Server entry
│   └── package.json
│
└── campus-event-hub/ # React frontend (rename to 'frontend')
    ├── src/
    │   ├── components/   # UI components
    │   ├── contexts/     # Auth context
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   └── lib/          # Utilities
    └── package.json
```

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:3001`

### Frontend

```bash
cd campus-event-hub
npm install
npm run dev
```

App runs at `http://localhost:8080`

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Firebase Auth

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Firestore Database

## Features

- User authentication (Student/Admin roles)
- Event creation and management (Admin)
- Event discovery and registration (Student)
- Real-time registration tracking
