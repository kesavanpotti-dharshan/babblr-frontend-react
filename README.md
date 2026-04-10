# Babblr — Frontend

A real-time chat application frontend built with **React 18** and **TypeScript**, connecting to the Babblr ASP.NET Core 8 backend via REST and SignalR WebSockets.

> **Live App:** https://babblr-chat.vercel.app  
> **Backend API:** https://babblr-api.azurewebsites.net/swagger  
> **Backend repo:** https://github.com/kesavanpotti-dharshan/babblr-backend-dotnet

---

## Features

- **JWT authentication** — register, login, logout with token stored in memory
- **Real-time messaging** — bidirectional WebSocket via SignalR JS client
- **Room management** — create, discover, join and leave public rooms
- **Message history** — paginated with load more support
- **Message actions** — edit and soft delete your own messages
- **Message search** — keyword search within a room
- **Typing indicators** — real-time "X is typing..." shown to room members
- **Online presence** — green dot indicators updated in real time
- **File uploads** — images and PDFs via Azure Blob Storage
- **User profile** — update display name and avatar
- **Light / dark theme** — toggle with localStorage persistence
- **Colour-coded avatars** — initials with consistent colour per user

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Real-time | @microsoft/signalr |
| HTTP client | Axios |
| Routing | React Router v6 |
| State management | Zustand |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Babblr backend API running (locally or on Azure)

### Setup

```bash
# Clone the repo
git clone https://github.com/kesavanpotti-dharshan/babblr-frontend-react.git
cd babblr-frontend-react

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set your backend URL in .env
VITE_API_URL=https://babblr-api.azurewebsites.net

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Project Structure

```
src/
├── api/
│   └── api.ts              ← axios instance + interceptors
├── components/
│   ├── auth/               ← Login, Register components
│   ├── chat/               ← ChatRoom, MessageList, MessageInput
│   ├── rooms/              ← RoomList, RoomCard, DiscoverRooms
│   └── ui/                 ← Avatar, ThemeToggle, shared components
├── hooks/
│   ├── useAuth.ts          ← auth state and actions
│   ├── useChat.ts          ← SignalR connection and message state
│   ├── useRooms.ts         ← room list and management
│   └── usePresence.ts      ← online/offline user tracking
├── services/
│   └── signalr.ts          ← SignalR hub connection management
├── store/
│   └── authStore.ts        ← Zustand auth store
└── types/
    └── index.ts            ← TypeScript interfaces for all API types
```

---

## SignalR Connection

The SignalR hub connects using the JWT token as a query string parameter:

```typescript
const connection = new HubConnectionBuilder()
  .withUrl(`${API_URL}/hubs/chat?access_token=${token}`)
  .withAutomaticReconnect()
  .build();
```

`withAutomaticReconnect()` handles network interruptions silently — the connection recovers without the user noticing.

---

## Error Handling

All API errors are handled via an axios response interceptor that reads the RFC 7807 ProblemDetails format returned by the backend:

```typescript
{
  "type": "https://httpstatuses.io/400",
  "title": "Bad request",
  "status": 400,
  "detail": "Email is already registered.",
  "traceId": "..."
}
```

The interceptor extracts `detail` and surfaces it as a user-friendly toast message.

---

## Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

Environment variables are configured in the Vercel dashboard:
- `VITE_API_URL` → `https://babblr-api.azurewebsites.net`

---

## Backend

The backend is a separate repository built with ASP.NET Core 8, Clean Architecture, SignalR, EF Core, and Azure services.

- Repo: [babblr-backend-dotnet](https://github.com/kesavanpotti-dharshan/babblr-backend-dotnet)
- API docs: https://babblr-api.azurewebsites.net/swagger

---

## Roadmap

- [ ] Mobile responsive layout
- [ ] Image preview for uploaded files in chat
- [ ] Message reactions
- [ ] Direct messaging between users
- [ ] Unread message count badges

---

## Author

**Dharshan Kesavanpotti** — .NET backend developer based in USA  
[GitHub](https://github.com/kesavanpotti-dharshan) · [LinkedIn](https://www.linkedin.com/in/dharshankesavan/)