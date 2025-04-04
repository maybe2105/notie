# Notie

A collaborative note-taking application with real-time editing and presence features.

## Local Development

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for PostgreSQL)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notie.git
cd notie
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Start the database:

```bash
pnpm run dev:db
```

5. Start development servers:

```bash
pnpm run dev
```

This will start:

- Client development server at http://localhost:5173
- Backend server at http://localhost:3001

### Development Commands

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `pnpm run dev:full`   | Start everything (database + client + server) |
| `pnpm run dev`        | Start client and server in development mode   |
| `pnpm run dev:db`     | Start only the PostgreSQL database            |
| `pnpm run dev:client` | Start only the client development server      |
| `pnpm run dev:server` | Start only the server development server      |

## Production Deployment

Build and run the entire application using Docker:

```bash
pnpm run docker:start
```

This will:

1. Start the PostgreSQL database
2. Build the frontend
3. Start the server with the built frontend

The application will be accessible at http://localhost:3000.

### Docker Commands

| Command                   | Description                        |
| ------------------------- | ---------------------------------- |
| `pnpm run docker:build`   | Build Docker images                |
| `pnpm run docker:up`      | Start Docker containers            |
| `pnpm run docker:down`    | Stop Docker containers             |
| `pnpm run docker:start`   | Build and start Docker containers  |
| `pnpm run docker:logs`    | View container logs                |
| `pnpm run docker:rebuild` | Rebuild and restart all containers |
| `pnpm run docker:clean`   | Stop containers and remove volumes |

## Project Structure

```
notie/
├── client/           # Frontend React application
├── server/           # Backend Node.js API
├── docker-compose.yml # Docker configuration
└── package.json      # Root package.json with scripts
```

## Decisions

1. Frontend stack is React + Typescript, powered by Vite
2. The requirements want to allow multiple users to edit a note in real-time, and handle conflict, after researching a bit i chose `sharedb` to handle real-time JSON document collaboration, with a simple `posgresql` as a DB to store notes
3. Choose `postcss` for css-module
4. Add `wouter` for routing, it's a 2.1kB routing library for react, very easy to use
5. use `Lexical` for Rich Text Editor
6. Handle confl
