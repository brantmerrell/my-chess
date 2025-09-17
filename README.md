# ASCII Chess Visualization

This application seeks to depict chess positions through ASCII art.

Live versions:
- React Application: [chess.jbm.eco](https://chess.jbm.eco)
- R Shiny Prototype: [josh-b-merrell.shinyapps.io/my-chess](https://josh-b-merrell.shinyapps.io/my-chess/)

## Overview

The project consists of an R Shiny prototype that evolved into a React application, with a Python FastAPI backend for shared functionality.

## Components

- ascii-chess-ts: React TypeScript frontend
- connector: Python FastAPI backend
- prototype-shiny: Original R Shiny implementation

### Tech Stack

**Frontend (React)**
- React with TypeScript
- Redux for state management
- D3.js for visualizations
- Chess.com and Lichess daily puzzle endpoints

**Backend (Python)**
- FastAPI
- Hosted on AWS ECS

**Prototype (R)**
- Shiny for reactive web framework
- Chess position visualization utilities

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure environment variables
3. Start the backend services:
```bash
docker-compose -f local.docker-compose.yml up
```

4. For frontend development:
```bash
cd ascii-chess-ts
npm install
npm start
```
The frontend is configured to connect to the local backend when running in development mode.

## Additional Documentation

For app-specific information, see:
- `/ascii-chess-ts/README.md` 
- `/connector/README.md`
- `/prototype-shiny/README.md`

