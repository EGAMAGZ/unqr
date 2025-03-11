import * as v from "@valibot/valibot";

export const FILE_TYPES = {
  "image/svg+xml": { label: "SVG", extension: "svg" },
  "image/png": { label: "PNG", extension: "png" },
  "image/jpeg": { label: "JPEG", extension: "jpeg" },
  "image/webp": { label: "WEBP", extension: "webp" },
};

export const QrCodeSchema = v.object({
  url: v.pipe(
    v.string("URL must be a string."),
    v.nonEmpty("URL is required."),
  ),
  fileType: v.picklist(
    Object.keys(FILE_TYPES),
    "Invalid file type.",
  ),
});

export type QrCode = v.InferInput<typeof QrCodeSchema>;

export type FileType = keyof typeof FILE_TYPES;
