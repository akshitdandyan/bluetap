import express from "express";
import cors from "cors";
import setupSocketAndServer from "./core/socketTower";
import connectDB from "./config/database.mongo";
import connectionRouter from "./routes/connection.route";
import fileRouter from "./routes/file.route";
import textRouter from "./routes/text.route";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/", (req, res) => {
  res.send("<p style='color:blue'>May BlueTap live forever</p>");
});

app.use(connectionRouter);
app.use(fileRouter);
app.use(textRouter);

const { io, server } = setupSocketAndServer(app);

server.listen(process.env.PORT, async () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  await connectDB();
});
