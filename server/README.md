# LogEase Server

This is the backend server for the LogEase application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3001
NODE_ENV=development
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3001 by default. You can change this by modifying the PORT variable in the `.env` file.

## API Endpoints

- `GET /api/health` - Health check endpoint 