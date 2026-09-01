# Realtime Grid Server

Node.js Express server with Socket.IO for real-time grid updates.

## Setup

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the server root:

```
PORT=3000
NODE_ENV=development
```

### Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## Features

- Express.js REST API
- Socket.IO for real-time communication
- CORS enabled for client requests
- Nodemon for development auto-reload

## Dependencies

- **express** - Web framework
- **socket.io** - Real-time bidirectional communication
- **cors** - Cross-origin resource sharing

## Dev Dependencies

- **nodemon** - Auto-restart on file changes
