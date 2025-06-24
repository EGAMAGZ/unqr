import { Copy as IconCopy } from "@/components/icons/Copy.tsx";
import { useQr } from "@/context/QrContext.tsx";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";
import { generateImageBlob } from "../util/image.ts";
import { FileType } from "../schema/qr-code.ts";

interface Props {
  class?: string;
}

export function CopyButton(props: Props) {
  const { isValid, qrData } = useQr();

  const handleClick = async () => {
    const { fileType, url, patternColor, backgroundColor } = qrData.value;
    const imgBlob = await generateImageBlob(
      fileType as FileType,
      url,
      patternColor,
      backgroundColor,
    );
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [imgBlob.type]: imgBlob }),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      type="button"
      class={`btn btn-secondary btn-sm rounded md:w-fit ${props.class ?? ""}`}
      disabled={!isValid.value || !IS_BROWSER}
      aria-disabled={!isValid.value || !IS_BROWSER}
      onClick={handleClick}
    >
      <IconCopy />
      Copy
    </button>
  );
}
