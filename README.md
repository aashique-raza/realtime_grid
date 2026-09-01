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

## Design Decisions

**Why Socket.IO** - needed instant, bidirectional updates (server → all clients the moment a tile is claimed). Socket.IO handles the WebSocket connection plus a polling fallback and reconnection out of the box, so it was simpler than hand-rolling a raw `ws` server for this scope.

**Why in-memory state** - `gridState` is a plain object living in the server process. For the size of this assignment that's enough, and it keeps the write path a single synchronous line with no extra infra to set up. Trade-off: state resets if the server restarts/redeploys. A real product would move this to Redis (fast, and multiple server instances could share it) or a small DB table if claims needed to survive restarts.

**Conflict handling** - the server is the single source of truth. When a `claimGrid` event comes in, it's only accepted if the tile is still unclaimed; otherwise the server emits `claimRejected` back to that socket instead of overwriting the existing owner. Because Node processes these events one at a time, this also resolves the "two people click the same empty tile at once" race - whichever claim reaches the server first wins, the second is rejected. The client also disables clicking on tiles that are already claimed, but the server check is what actually enforces it (client-side is just UX, not trusted).

**What's not implemented** - cooldowns/area-control rules, a per-user leaderboard, and zoom/pan were left out to keep the scope focused on the core real-time + conflict-handling loop within the time available. The architecture (one `gridState` object + two socket events) would extend to a leaderboard easily (derive counts per name from `gridState`); zoom/pan would mainly be a CSS/viewport change on the `.board` grid.
