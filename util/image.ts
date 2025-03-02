import { FileType } from "../schema/qr-code.ts";
import QrCodeGenerator from "qrcode";

export async function generateImageBlob(
  fileType: FileType,
  url: string,
) {
  let content;
  console.log(fileType);
  switch (fileType) {
    case "image/svg+xml":
      content = await QrCodeGenerator.toString(url, { type: "svg" });
      break;
    default:
      content = await QrCodeGenerator.toDataURL(url, { type: fileType });
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
