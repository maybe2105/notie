# Notie

A collaborative note-taking application with real-time editing and presence features.

1. Frontend stack is React + Typescript, powered by Vite`
2. The requirements want to allow multiple users to edit a note in real-time, and handle conflict, after researching a bit i chose `sharedb` to handle real-time JSON document collaboration, with a simple `posgresql` as a DB to store notes
3. Conflict will be solve by `sharedb` **Operational transformation (https://en.wikipedia.org/wiki/Operational_transformation)**, webserver will receive operations from frontend, then cast the change to frontend client that subscribed to the document, then client make change on openration received
4. use `Lexical` for Rich Text Editor
5. use `react-window`, and `react-window-infinite-loader`, to increase performance, virtually display the long list and only load 20 items at a time to reduce load on backend
6. use React `ContextAPI` to handle state in main page, and use local state to handle data in isolated Note page,
7. using `vitest` for components testing, run with `pnpm dev:test`

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for PostgreSQL)

### How to run immedialy with docker (Production mode)

You dont have to install everything in this project to run, just need Docker and it's ready

```bash
git clone https://github.com/maybe2105/notie.git
cd notie
pnpm run docker:start
```

This will run everything with `docker-compose`, include setting up database, build frontend project, run web server
</br>
Then access

```bash
localhost:3000
```

More on the detail in the <a href="#production-deployment">Production deployment document</a>

### Setup dev

1. Clone the repository:

```bash
git clone https://github.com/maybe2105/notie.git
cd notie
```

2. Install (client + server) dependencies:

```bash
pnpm install
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
| `pnpm run dev:test`   | Test frontend project                         |

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
