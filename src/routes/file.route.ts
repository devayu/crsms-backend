import express, { Request, Response, Router } from "express";
import { MEDIA_DIR } from "../constants";
import { scanMediaDirectory } from "../utils";
const router: Router = express.Router();

router.get("/scan", async (_: Request, res: Response) => {
  try {
    const files = await scanMediaDirectory(MEDIA_DIR);
    res.status(200).json(files);
  } catch (e) {
    console.error("Error in getting file structure:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/scan/:fileSlug", async (req: Request, res: Response) => {
  try {
    const fileSlug = req.params.fileSlug;
    const files = await scanMediaDirectory(`${MEDIA_DIR}/${fileSlug}`);
    res.status(200).json(files);
  } catch (e) {
    console.error("Error in getting file structure:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
