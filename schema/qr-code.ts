import * as v from "@valibot/valibot";

export const FILE_TYPES = {
  "image/svg+xml": { label: "SVG", extension: "svg" },
  "image/png": { label: "PNG", extension: "png" },
  "image/jpeg": { label: "JPEG", extension: "jpeg" },
  "image/webp": { label: "WEBP", extension: "webp" },
};

export const QrCodeSchema = v.object({
  url: v.string("Url no es un string"),
  fileType: v.picklist(
    Object.keys(FILE_TYPES),
    "Tipo de archivo invalido",
  ),
});

export type QrCode = v.InferInput<typeof QrCodeSchema>;

export type FileType = keyof typeof FILE_TYPES;
