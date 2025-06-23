import { Share as ShareIcon } from "../components/icons/Share.tsx";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";
import { generateImageBlob, generateImageFile } from "../util/image.ts";
import { FILE_TYPES, FileType } from "../schema/qr-code.ts";
import { useQr } from "../context/QrContext.tsx";
export function ShareButton() {
  const { isValid, qrData } = useQr();
  const handleClick = async () => {
    const { fileType, url, patternColor, backgroundColor } = qrData.value;
    const imageFile = generateImageFile(
      await generateImageBlob(
        fileType as FileType,
        url,
        patternColor,
        backgroundColor,
      ),
      FILE_TYPES[fileType as FileType].extension,
    );
    try {
      await navigator.share({
        files: [imageFile],
      });
    } catch (error) {
      console.error(error);
    }
  };
  if (!navigator.canShare) return null;
  return (
    <button
      type="button"
      onClick={handleClick}
      class="btn btn-primary btn-sm rounded md:w-fit"
      disabled={!isValid.value || !IS_BROWSER}
      aria-disabled={!isValid.value || !IS_BROWSER}
    >
      <ShareIcon />
      Share
    </button>
  );
}
