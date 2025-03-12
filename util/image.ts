import { FileType } from "../schema/qr-code.ts";
import QrCodeGenerator from "qrcode";

export async function generateImageBlob(
  fileType: FileType,
  url: string,
  patternColor: string,
  backgroundColor: string,
) {
  let content;
  const color = {
    dark: patternColor,
    light: backgroundColor,
  };

  switch (fileType) {
    case "image/svg+xml":
      content = await QrCodeGenerator.toString(url, { type: "svg", color });
      break;
    // deno-lint-ignore no-case-declarations
    default:
      content = await QrCodeGenerator.toDataURL(url, {
        type: fileType,
        color,
      });
      const base64Data = content.split(",")[1];
      content = atob(base64Data);
      const bytes = new Uint8Array(content.length);
      for (let i = 0; i < content.length; i++) {
        bytes[i] = content.charCodeAt(i);
      }
      content = bytes;
      break;
  }

  return new Blob([content], { type: fileType });
}
