import * as v from "@valibot/valibot";

export const FILE_TYPES = {
  "image/svg+xml": { label: "SVG", extension: "svg" },
  "image/png": { label: "PNG", extension: "png" },
  "image/jpeg": { label: "JPEG", extension: "jpeg" },
  "image/webp": { label: "WEBP", extension: "webp" },
};

export const QrCodeSchema = v.object({
  url: v.pipe(
    v.string("Please enter a valid web address."),
    v.nonEmpty("A web address is required to generate the QR code."),
  ),
  fileType: v.picklist(
    Object.keys(FILE_TYPES),
    "Please select a valid file format for the QR code.",
  ),
  patternColor: v.pipe(
    v.string("Please enter a valid color code for the pattern."),
    v.nonEmpty("A pattern color is required."),
    v.hexColor("Please enter a valid hex color code (e.g. #FFFFFF)."),
  ),
  backgroundColor: v.pipe(
    v.string("Please enter a valid color code for the background."),
    v.nonEmpty("A background color is required."),
    v.hexColor("Please enter a valid hex color code (e.g. #FFFFFF)."),
  ),
});

export type QrCode = v.InferInput<typeof QrCodeSchema>;

export type FileType = keyof typeof FILE_TYPES;

export const QrCodeWithColorValidationSchema = v.pipe(
  QrCodeSchema,
  v.forward(
    v.check(({ backgroundColor, patternColor }) =>
      patternColor !== backgroundColor
    ),
    ["backgroundColor"],
  ),
);

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
