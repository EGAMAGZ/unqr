import { safeParse } from "@valibot/valibot";
import {
  FILE_TYPES,
  FileType,
  QrCode,
  QrCodeSchema,
} from "../schema/qr-code.ts";
import { useSignal, useSignalEffect } from "@preact/signals";
import QrCodeGenerator from "qrcode";
import { PLACEHOLDER_URL } from "../util/constants.ts";
import { Download } from "../components/icons/Download.tsx";
import { generateImageBlob } from "../util/image.ts";

interface QrCodeFormProps {
  class?: string;
}

export function QrCodeForm(props: QrCodeFormProps) {
  const url = useSignal(PLACEHOLDER_URL);

  return (
    <div class={`flex gap-4 ${props.class ?? ""}`}>
      <QrCodeImg url={url.value} class="flex-1" />
      <div class="flex-1">
        <span class="text-4xl font-semibold">Generar Codigo QR</span>
        <div class="divider" />
        <UrlForm />
      </div>
    </div>
  );
}

export function QrCodeImg(props: { url: string; class?: string }) {
  const error = useSignal<string | null>(null);
  const qrCodeSrc = useSignal<string | null>(null);
  const generateQr = async () => {
    try {
      const dataUrl = await QrCodeGenerator.toString(props.url, {
        type: "svg",
      });
      qrCodeSrc.value = dataUrl;
      error.value = null;
    } catch (e) {
      error.value = "Error al generar el QR";
      qrCodeSrc.value = null;
      console.error(e);
    }
  };

  useSignalEffect(() => {
    generateQr();
  });

  return qrCodeSrc.value
    ? (
      <div
        class={`border border-slate-300 bg-neutral-200 w-full p-6 rounded-xl svg-transparent ${
          props.class ?? ""
        }`}
        // deno-lint-ignore react-no-danger
        dangerouslySetInnerHTML={{ __html: qrCodeSrc.value }}
      >
      </div>
    )
    : null;
}

function UrlForm() {
  const qrCodeData = useSignal<QrCode | null>(null);
  const error = useSignal<string | null>(null);

  const downloable = useSignal(false);

  const handleChange = (_event: Event) => {
    console.log("CHANGE");
    const formData = new FormData();

    // Get the current values of both inputs
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
      downloable.value = false;
      error.value = issues[0].message;
      qrCodeData.value = null;
      return;
    }

    downloable.value = true;
    error.value = null;
    qrCodeData.value = output;
  };

  const downloadCode = async () => {
    const data = qrCodeData.value as QrCode;
    if (data) {
      const blobURL = URL.createObjectURL(
        await generateImageBlob(data.fileType as FileType, data.url),
      );

      const linkElement = document.createElement("a");
      linkElement.href = blobURL;
      linkElement.download = `unqr-code.${FILE_TYPES[data.fileType as FileType].extension}`;
      linkElement.click();

      URL.revokeObjectURL(blobURL);
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <label class="form-control">
        <div class="label">
          <span class="label-text">Escribe o pega la URL:</span>
          <span class="label-text-alt">Tu codigo QR abrirá esta URL</span>
        </div>
        <div class="join flex">
          <input
            type="text"
            class="input input-primary input-bordered input-sm join-item flex-1"
            name="url"
            onInput={handleChange}
          />
          <select
            class="select select-primary select-sm join-item"
            name="fileType"
            onChange={handleChange}
          >
            {Object.entries(FILE_TYPES).map(([key, value]) => (
              <option value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        {error.value
          ? (
            <div class="label">
              <span class="label-text text-red-400">{error}</span>
            </div>
          )
          : null}
      </label>

      <button
        type="button"
        onClick={downloadCode}
        class={`btn btn-primary btn-sm rounded w-fit ${
          !downloable.value ? "btn-disabled" : ""
        }`}
        disabled={!downloable.value}
      >
        <Download class="size-3" />
        Descargar
      </button>
    </div>
  );
}
