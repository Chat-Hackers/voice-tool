import express from "express";
import * as fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import handleMessage from "./message";
import handleReaction from "./reaction";
import { deleteGroupUrl, getGroupUrl, insertGroupUrl, startDuckDB } from "./duckdb";

const port = 5055;

const moduleRegistration = {
  id: "voice",
  uuid: uuidv4(),
  url: `http://localhost:${port}`,
  emoji: "🎤",
  introduction: "React with 🎤 to a message containing the destination url for voice messages.",
  title: "Voice Forwarder",
  description: "Forwards audio messages to an address of your choice",
  event_types: [
    "m.room.message", "m.reaction"
  ]
}

function generateRegistrationFile() {
  fs.writeFileSync(`./${moduleRegistration.id}.json`, JSON.stringify(moduleRegistration, null, 2));
}

async function start() {
  const app = express();
  app.use(express.json());
  await startDuckDB()

  app.get("/", async (req, res) => {
    const htmlPath = path.resolve(__dirname, "../../web/dist/index.html")

    res.sendFile(htmlPath);
  })

  app.post("/", async (req, res) => {
    const { event } = req.body;

    console.log("event received", event)
    let response;

    if (event.type === "m.room.message")
      response = await handleMessage(event);

    if (event.type === "m.reaction") {
      response = await handleReaction(event);
    }

    console.log("response", response);

    res.send({ success: true, response });
  });

  app.get("/api/voice", async (req, res) => {
    const { roomId } = req.query;

    const groupUrl = await getGroupUrl(roomId as string);

    res.send({ success: true, ...groupUrl });
  })

  app.post("/api/voice", async (req, res) => {
    const { roomId } = req.query;
    const { url } = req.body;

    await deleteGroupUrl(roomId as string);
    await insertGroupUrl(roomId as string, url);

    res.send({ success: true });
  })

  app.delete("/api/voice", async (req, res) => {
    const { roomId } = req.query;

    await deleteGroupUrl(roomId as string);

    res.send({ success: true });
  })

  app.listen(port);
};

generateRegistrationFile();
start();
