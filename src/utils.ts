import ffmpeg from "fluent-ffmpeg";
import { MEDIA_DIR, THUMBNAIL_DIR } from "./constants";
import fs from "fs";
import { FileStructure, VideoMetadata } from "./types/types";
import path from "path";

export const getVideoMetadata = async (
  filePath: string
): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      const audioStream = metadata.streams.find(
        (stream) => stream.codec_type === "audio"
      );

      const videoMetadata: VideoMetadata = {
        filename: filePath,
        size: metadata.format.size || 0,
        duration: parseFloat(String(metadata.format.duration) || "0"),
        format: metadata.format.format_name || "",
        videoCodec: videoStream?.codec_name,
        audioCodec: audioStream?.codec_name,
        width: videoStream?.width,
        height: videoStream?.height,
        bitrate: parseInt(String(metadata.format.bit_rate) || "0"),
      };

      resolve(videoMetadata);
    });
  });
};

export const generateThumbnail = (fileHash: string, filePath: string) => {
  ensureThumbnailDirectoryExists();
  const existingThumbnailPath = `${THUMBNAIL_DIR}/${fileHash}.jpg`;

  if (fs.existsSync(existingThumbnailPath)) {
    console.info(`Thumbnail for ${filePath} already exists, skipping creation`);
    return;
  }

  _generateThumbnail(fileHash, filePath);
};

const ensureThumbnailDirectoryExists = () => {
  if (!fs.existsSync(THUMBNAIL_DIR)) {
    fs.mkdirSync(THUMBNAIL_DIR);
  }
};

const _generateThumbnail = (fileHash: string, filePath: string) => {
  ffmpeg(filePath)
    .screenshots({
      timestamps: [1], // Capture a thumbnail at 1 second into the video
      filename: `${fileHash}.jpg`, // Generate a unique filename
      folder: THUMBNAIL_DIR,
    })
    .on("end", () => {
      console.log("Thumbnail generated successfully.");
    })
    .on("error", (err) => {
      console.error("Error generating thumbnail:", err);
    });
};

export const scanMediaDirectory = async (directory: string) => {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });

  const result = entries
    .map((entry) => {
      const relativePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: "directory" as const,
          slug: entry.name.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".webm"];

      if (videoExtensions.includes(path.extname(entry.name).toLowerCase())) {
        return {
          name: entry.name,
          type: "file" as const,
          path: relativePath,
          slug: path.parse(entry.name).name.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      return null;
    })
    .filter(Boolean); // Remove null entries

  return result;
};
