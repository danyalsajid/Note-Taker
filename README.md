# Note Taker App

A full-stack note-taking application built with SolidJS frontend and Express.js backend.

## Features

- Create, read, update, and delete notes
- SQLite database with Drizzle ORM
- Modern SolidJS frontend with Bootstrap styling
- RESTful API backend

## Tech Stack

- **Frontend**: SolidJS, Vite, Bootstrap, TypeScript
- **Backend**: Express.js, Node.js
- **Database**: SQLite with Drizzle ORM
- **Deployment**: Railway

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run both frontend and backend:
   ```bash
   npm run dev:all
   ```

3. Or run them separately:
   ```bash
   # Frontend (port 3000)
   npm run dev

   # Backend (port 3001)
   npm run dev:server
   ```

## Deployment to Railway

### Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account

### Deploy Steps

1. **Login to Railway:**
   ```bash
   railway login
   ```

2. **Initialize Railway project:**
   ```bash
   railway init
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically detect the configuration and deploy

### Configuration Files

- `railway.toml` - Railway-specific configuration

### Environment Variables

The app uses the following environment variables:
- `PORT` - Server port (automatically set by Railway)
- `NODE_ENV` - Set to "production" for deployment

### Database

The SQLite database file (`db.sqlite`) is included in the repository for simplicity. In production, you might want to use Railway's PostgreSQL add-on for better persistence and scalability.

## API Endpoints

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Project Structure

```
├── src/                 # Frontend SolidJS code
├── server/             # Backend Express.js code
│   ├── db/            # Database configuration
│   └── index.js       # Main server file
├── dist/              # Built frontend (generated)
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite configuration
└── railway.toml       # Railway deployment config
```