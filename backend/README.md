# Campus Event Hub - Backend

An Express.js backend API for the Campus Event Hub application.

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Firebase Admin** - Authentication & Firestore

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |
| GET | `/api/events` | Get all events | No |
| GET | `/api/events/:id` | Get event by ID | No |
| POST | `/api/events` | Create event | Yes |
| PUT | `/api/events/:id` | Update event | Yes |
| DELETE | `/api/events/:id` | Delete event | Yes |
| GET | `/api/registrations/my` | Get user's registrations | Yes |
| GET | `/api/registrations/event/:id` | Get event registrations | Yes |
| POST | `/api/registrations` | Register for event | Yes |
| DELETE | `/api/registrations/:id` | Unregister | Yes |

## Project Structure

```
src/
├── config/         # Firebase configuration
├── middleware/     # Auth middleware
├── routes/         # API route handlers
└── index.js        # Server entry point
```
