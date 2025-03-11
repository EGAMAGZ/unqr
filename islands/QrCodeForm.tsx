import { safeParse } from "@valibot/valibot";
import {
  FILE_TYPES,
  FileType,
  QrCode,
  QrCodeSchema,
} from "../schema/qr-code.ts";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import QrCodeGenerator from "qrcode";
import { PLACEHOLDER_URL } from "../util/constants.ts";
import { Download } from "../components/icons/Download.tsx";
import { generateImageBlob } from "../util/image.ts";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";
import { QrCodeImageContainer } from "../components/QrCodeImageContainer.tsx";

interface QrCodeFormProps {
  class?: string;
}

interface QrCodeImgProps {
  url: Signal<string>;
  class?: string;
}

interface UrlFormProps {
  url: Signal<string>;
}

function UrlInput({ onChange }: { onChange: (event: Event) => void }) {
  return (
    <input
      type="text"
      class="input input-primary input-bordered input-sm join-item flex-1"
      name="url"
      onInput={onChange}
      placeholder="https://example.com"
      aria-label="Enter URL for QR Code"
    />
  );
}

function FileTypeSelect({ onChange }: { onChange: (event: Event) => void }) {
  return (
    <select
      class="select select-primary select-sm join-item bg-primary text-primary-content"
      name="fileType"
      onChange={onChange}
      aria-label="Select file type for QR Code"
    >
      {Object.entries(FILE_TYPES).map(([key, value]) => (
        <option key={key} value={key}>{value.label}</option>
      ))}
    </select>
  );
}

export function QrCodeForm(props: QrCodeFormProps) {
  const url = useSignal<string>("");
  return (
    <div class={`flex flex-col-reverse md:flex-row gap-4 ${props.class ?? ""}`}>
      <QrCodeImage url={url} class="flex-1" />
      <div class="flex-1">
        <span class="text-4xl font-semibold">Generate QR Code</span>
        <div class="divider" />
        <UrlForm url={url} />
      </div>
    </div>
  );
}

export function QrCodeImage({ url, class: className }: QrCodeImgProps) {
  const error = useSignal<string | null>(null);
  const qrCodeSrc = useSignal<string | null>(null);

  const generateQr = async (url: string) => {
    try {
      const dataUrl = await QrCodeGenerator.toString(url, { type: "svg" });
      qrCodeSrc.value = dataUrl;
      error.value = null;
    } catch (e) {
      error.value = "Failed to generate QR code. Please try again.";
      qrCodeSrc.value = null;
      console.error("QR Code generation error:", e);
    }
  };

  useSignalEffect(() => {
    const currentUrl = url.value === "" ? PLACEHOLDER_URL : url.value;
    generateQr(currentUrl);
  });

  if (!qrCodeSrc.value) return null;

  return (
    <QrCodeImageContainer
      src={qrCodeSrc.value}
      class={className}
      isPlaceholder={url.value === ""}
    />
  );
}

function UrlForm({ url }: UrlFormProps) {
  const qrCodeData = useSignal<QrCode | null>(null);
  const error = useSignal<string | null>(null);
  const downloadable = useSignal(false);

  const handleChange = () => {
    const formData = new FormData();
    const urlInput = document.querySelector(
      'input[name="url"]',
    ) as HTMLInputElement;
    const fileTypeSelect = document.querySelector(
      'select[name="fileType"]',
    ) as HTMLSelectElement;

    formData.append("url", urlInput.value);
    formData.append("fileType", fileTypeSelect.value);

    const { success, issues, output } = safeParse(
      QrCodeSchema,
      Object.fromEntries(formData.entries()),
    );

    if (!success) {
      downloadable.value = false;
      error.value = issues[0].message || "Invalid input";
      qrCodeData.value = null;
      url.value = "";
      return;
    }

    downloadable.value = true;
    error.value = null;
    qrCodeData.value = output;
    url.value = output.url;
  };

  const downloadCode = async () => {
    if (!qrCodeData.value) return;

    const { fileType, url: qrUrl } = qrCodeData.value;
    const extension = FILE_TYPES[fileType as FileType].extension;
    const blobURL = URL.createObjectURL(
      await generateImageBlob(fileType as FileType, qrUrl),
    );

    const linkElement = document.createElement("a");
    linkElement.href = blobURL;
    linkElement.download = `unqr-code.${extension}`;
    linkElement.click();
    URL.revokeObjectURL(blobURL);
  };

  return (
    <div class="flex flex-col gap-4">
      <label class="form-control">
        <div class="label">
          <span class="label-text">Enter or paste the URL:</span>
          <span class="label-text-alt">Your QR Code will open the URL</span>
        </div>
        <div class="join flex">
          <UrlInput onChange={handleChange} />
          <FileTypeSelect onChange={handleChange} />
        </div>
        {error.value && (
          <div class="label">
            <span class="label-text text-red-400" role="alert">
              {error.value}
            </span>
          </div>
        )}
      </label>
      <button
        type="button"
        onClick={downloadCode}
        class={`btn btn-primary btn-sm rounded md:w-fit ${
          !downloadable.value ? "btn-disabled" : ""
        }`}
        disabled={!downloadable.value || !IS_BROWSER}
        aria-disabled={!downloadable.value || !IS_BROWSER}
      >
        <Download class="size-4" />
        Download
      </button>
    </div>
  );
}
