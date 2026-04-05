# Babblr — Frontend

React 18 frontend for [Babblr](https://github.com/kesavanpotti-dharshan/babblr-backend-dotnet), 
a real-time messaging application built with ASP.NET Core 8 and SignalR.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- @microsoft/signalr — real-time WebSocket connection
- Axios — REST API calls
- React Router v6
- Zustand — state management

## Features

- JWT authentication (register and login)
- Real-time messaging via SignalR
- Room creation and management
- Message history with pagination
- Edit and delete messages
- Typing indicators
- Online presence tracking

## Getting Started

### Prerequisites
- Node.js 18+
- Babblr backend API running

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your backend URL
VITE_API_URL=https://your-backend.azurewebsites.net

# Start dev server
npm run dev
```

## Backend

The backend API repository is at:  
[babblr-backend-dotnet](https://github.com/kesavanpotti-dharshan/babblr-backend-dotnet)

## Author

**Dharshan** — [GitHub](https://github.com/kesavanpotti-dharshan)
