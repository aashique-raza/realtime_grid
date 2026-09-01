import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from server");
});

const gridState = {};

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  //  new user connected
  console.log("A user connected");

  //   send complet current state of the grid to the newly connected user
  socket.emit("initialGridState", gridState);

  //  client can also ask for the current state (avoids a race on first mount)
  socket.on("getGrid", () => {
    socket.emit("initialGridState", gridState);
  });

  //  listen for grid updates from the client
  socket.on("claimGrid", (data) => {
    const { blockId, name, color } = data;
    if (!blockId || !name || !color) {
      console.error("Invalid data received:", data);
      return;
    }

    //  block already taken - reject instead of letting it get overwritten.
    //  server is the source of truth so this is also what settles two
    //  people clicking the same empty tile at the same time (first one
    //  to arrive here wins, the second sees it as already claimed)
    if (gridState[blockId]) {
      socket.emit("claimRejected", { blockId, owner: gridState[blockId].name });
      return;
    }

    gridState[blockId] = { name, color };
    io.emit("blockUpdated", { blockId, name, color });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
