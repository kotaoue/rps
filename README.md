# rps

A Rock Paper Scissors game implemented in multiple languages and frameworks, exploring how the same game logic can be built across different technology stacks.

## Demo

▶️ [Play on Vercel](https://rps-gamma-ten.vercel.app/)

## Implementations

| Language / Framework | Directory | Deployment |
|---|---|---|
| JavaScript (Vanilla) | [javascript](./javascript) | Static |
| Node.js | [node](./node) | Serverless (`/api/node`) |
| Go | [go](./go) | Serverless (`/api/go`) |
| Next.js | [nextjs](./nextjs) | Serverless |
| TypeScript | [typescript](./typescript) | Standalone server |

## Project Structure

```
rps/
├── api/            # Vercel serverless function entrypoints
│   ├── go.go       # Go handler
│   └── node.js     # Node.js handler
├── go/             # Standalone Go HTTP server
├── javascript/     # Vanilla JS static frontend
├── nextjs/         # Next.js implementation
├── node/           # Standalone Node.js HTTP server
├── typescript/     # Standalone TypeScript HTTP server
├── pkg/rps/        # Shared Go game logic package
├── index.html      # Root landing page
├── style.css       # Shared stylesheet
└── vercel.json     # Vercel deployment configuration
```

## Getting Started

### Go

```bash
go run ./go
# Server running at http://localhost:8080
```

### Node.js

```bash
node node/server.js
# Server running at http://localhost:8080
```

### TypeScript

```bash
cd typescript
npm install
npm run build
npm start
# Server running at http://localhost:8080
```

### Next.js

```bash
cd nextjs
npm install
npm run dev
# Server running at http://localhost:3000
```

### Docker

Each implementation includes a `Dockerfile`:

```bash
# Go
docker build -f go/Dockerfile -t rps-go .
docker run -p 8080:8080 rps-go

# Node.js
docker build -f node/Dockerfile -t rps-node .
docker run -p 8080:8080 rps-node

# TypeScript
docker build -f typescript/Dockerfile -t rps-typescript .
docker run -p 8080:8080 rps-typescript

# Next.js
docker build -f nextjs/Dockerfile -t rps-nextjs .
docker run -p 3000:3000 rps-nextjs
```
