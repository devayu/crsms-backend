import express, { Express } from "express";
import fileRoutes from "../src/routes/file.route";
import streamRoutes from "../src/routes/stream.route";
const app: Express = express();
app.use(express.static("public"));
const PORT = process.env.PORT || 3090;

app.use("/api/media", fileRoutes);
app.use("/api/stream", streamRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
