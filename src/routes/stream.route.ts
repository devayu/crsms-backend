import express, { Request, Response, Router } from "express";
import { MEDIA_DIR, PUBLIC_DIR } from "../constants";
import fs from "fs";
import crypto from "crypto";
import { generateThumbnail, getVideoMetadata } from "../utils";
const router: Router = express.Router();

router.get("/:hash", async (req: Request, res: Response): Promise<void> => {
  try {
    const requestedVideoId = req.params.hash;
    if (!requestedVideoId) {
      res.status(400).json({ error: "Video ID is required" });
      return;
    }

    const requestedVideoPath = `${MEDIA_DIR}/${requestedVideoId}.mp4`;

    // Check if file exists first
    if (!fs.existsSync(requestedVideoPath)) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    const [metadata, stat] = await Promise.all([
      getVideoMetadata(requestedVideoPath),
      fs.promises.stat(requestedVideoPath),
    ]);

    const fileHash = crypto.createHash("sha256");
    const fileStream = fs.createReadStream(requestedVideoPath);

    res.setHeader("content-type", "video/mp4");
    res.setHeader("content-length", stat.size);

    fileStream.on("data", (data) => fileHash.update(data));

    fileStream.on("end", async () => {
      try {
        const finalHash = fileHash.digest("hex");
        generateThumbnail(finalHash, requestedVideoPath);
        console.log(finalHash, "fileHash");
      } catch (error) {
        console.error("Error processing video end:", error);
      }
    });

    fileStream.on("error", (error: Error) => {
      console.error(`Error reading file ${requestedVideoPath}:`, error);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ error: "Error streaming video" });
      }
    });

    console.log(metadata, "metadata");
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error in getVideo:", error);
    // Only send error if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
