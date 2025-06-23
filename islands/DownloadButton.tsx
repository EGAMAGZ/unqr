import { Download } from "../components/icons/Download.tsx";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";
import { useQr } from "../context/QrContext.tsx";
import { DEFAULT_FILE_NAME } from "../util/constants.ts";
import { generateImageBlob } from "../util/image.ts";
import { FILE_TYPES, FileType } from "../schema/qr-code.ts";

export function DownloadButton() {
  const { isValid, qrData } = useQr();
  const handleClick = async () => {
    const { fileType, url, patternColor, backgroundColor } = qrData.value;
    const blobURL = URL.createObjectURL(
      await generateImageBlob(
        fileType as FileType,
        url,
        patternColor,
        backgroundColor,
      ),
    );

    const { extension } = FILE_TYPES[fileType as FileType];

    const linkElement = document.createElement("a");
    linkElement.href = blobURL;
    linkElement.download = `${DEFAULT_FILE_NAME}.${extension}`;
    linkElement.click();
    URL.revokeObjectURL(blobURL);
    linkElement.remove();
  };
  return (
    <button
      type="button"
      class="btn btn-primary btn-sm rounded md:w-fit"
      disabled={!isValid.value || !IS_BROWSER}
      aria-disabled={!isValid.value || !IS_BROWSER}
      onClick={handleClick}
    >
      <Download class="size-4" />
      Download
    </button>
  );
}
