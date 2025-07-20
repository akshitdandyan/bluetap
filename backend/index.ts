import express from "express";
import cors from "cors";
import setupSocketAndServer from "./core/socketTower";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

const { io, server } = setupSocketAndServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
