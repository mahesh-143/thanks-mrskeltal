import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors());

const DATABASE_URL = process.env.DATABASE_URL;
try {
  mongoose.connect(DATABASE_URL);
} catch (err) {
  console.log(err);
}
const TotalThanks = mongoose.model("TotalThanks", { count: Number });

const io = new Server({
  cors: {
    origin: ["http://localhost:5173", "https://thanks-mrskeltal.vercel.app/"],
  },
});

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  const totalThanks = await getTotalThanks();
  socket.emit("totalThanks", totalThanks);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("thanks", async (userData) => {
    const updatedCount = await incrementTotalThanks();
    io.emit("newUser", userData, totalThanks);
    io.emit("totalThanks", updatedCount);
  });
});

async function getTotalThanks() {
  try {
    const result = await TotalThanks.findOne();
    return result ? result.count : 0;
  } catch (error) {
    console.error("Error reading total thanks from database:", error);
    return 0;
  }
}

async function incrementTotalThanks() {
  try {
    const updatedCount = await TotalThanks.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true },
    );
    return updatedCount.count;
  } catch (error) {
    console.error("Error updating total usernames in database:", error);
    return 0;
  }
}

io.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
