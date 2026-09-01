# Realtime Grid Server

Node.js + Express backend with Socket.IO for the realtime grid app. It keeps track of the grid state and pushes updates to everyone connected the moment a tile gets claimed.

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

**Development (auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Runs on `http://localhost:3000` by default.

## Features

- Express REST API
- Socket.IO for realtime updates
- CORS enabled so the client can talk to it
- Nodemon for dev

## Dependencies

- **express** - web framework
- **socket.io** - realtime, bidirectional communication
- **cors** - so the frontend (different origin) can actually hit this server

## Dev Dependencies

- **nodemon** - restarts the server automatically while developing

## Why I built it this way

I went with Socket.IO instead of a plain `ws` server mainly because I didn't want to deal with reconnection logic and transport fallbacks myself. Socket.IO already handles that, and for a project this size that mattered more to me than saving one dependency.

For the grid data, I just kept it as a plain object in memory (`gridState`) instead of setting up a database. It's simple and the write path is basically one line. Downside is obvious - if the server restarts, everything resets and all tiles go back to unclaimed. If this ever needed to survive restarts or run on multiple instances, I'd move it to Redis instead.

The part I spent the most time on was actually conflicts - what happens if two people click the same tile at almost the same moment. The server is the only source of truth for ownership. When a `claimGrid` event comes in, it only goes through if that tile is still unclaimed - if someone already grabbed it, the server sends back a `claimRejected` event instead of just overwriting the existing owner. Since Node handles events one at a time anyway, whichever claim reaches the server first wins and the second one gets rejected. I also block clicks on already-claimed tiles on the frontend, but that's just for a smoother feel - the actual enforcement is server-side since the client can't be trusted.

What I didn't get to: cooldowns, area control rules, a leaderboard, zoom/pan on the board. Mostly ran out of time and wanted the core realtime + conflict handling to actually be solid instead of spreading effort across every bonus item. A leaderboard would be a quick add later (just count tiles per name from `gridState`), zoom/pan would mainly be CSS work on the grid.
