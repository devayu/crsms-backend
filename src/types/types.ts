export type VideoMetadata = {
  filename: string;
  size: number;
  duration: number;
  format: string;
  videoCodec?: string;
  audioCodec?: string;
  width?: number;
  height?: number;
  bitrate?: number;
};

type FILE_TYPES = "file" | "directory";

export type FileStructure = {
  name?: string;
  type?: FILE_TYPES;
  path?: string;
  slug?: string;
};
