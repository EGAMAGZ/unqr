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
  patternColor: v.pipe(
    v.string("Color must be a string."),
    v.nonEmpty("Color is required."),
    v.hexColor("Invalid color format."),
  ),
  backgroundColor: v.pipe(
    v.string("Color must be a string."),
    v.nonEmpty("Color is required."),
    v.hexColor("Invalid color format."),
  ),
});

export type QrCode = v.InferInput<typeof QrCodeSchema>;

export type FileType = keyof typeof FILE_TYPES;

export const validateColors = (patternColor: string, backgroundColor: string) =>
  v.safeParse(
    v.pipe(
      v.pick(QrCodeSchema, ["backgroundColor", "patternColor"]),
      v.forward(
        v.check(
          ({ backgroundColor, patternColor }) =>
            backgroundColor !== patternColor,
          "Pattern color and background color cannot be the same",
        ),
        ["backgroundColor"],
      ),
    ),
    {
      patternColor,
      backgroundColor,
    },
  );
