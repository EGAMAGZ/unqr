import * as v from "@valibot/valibot";
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
import { TabNav } from "./TabNav.tsx";

interface QrCodeFormProps {
  class?: string;
}

interface UrlInputProps {
  url: Signal<string>;
}

function UrlInput(props: UrlInputProps) {
  const errorMessage = useSignal<string | null>(null);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    props.url.value = target.value;

    const { success, issues } = v.safeParse(v.pick(QrCodeSchema, ["url"]), {
      url: props.url.value,
    });

    if (!success) {
      errorMessage.value = issues[0].message;
    } else {
      errorMessage.value = null;
    }
  };
  return (
    <label class="form-control w-full max-w-lg">
      <div class="label">
        <span class="label-text">Enter or paste the URL:</span>
        <span class="label-text-alt">Your QR Code will open the URL</span>
      </div>
      <input
        type="text"
        name="url"
        class="input input-bordered input-sm input-primary w-full max-w-lg"
        value={props.url.value}
        onInput={handleInput}
      />
      {errorMessage.value && (
        <div class="label">
          <span class="label-text text-error">{errorMessage.value}</span>
        </div>
      )}
    </label>
  );
}

interface FileTypeSelectProps {
  fileType: Signal<FileType>;
}

function FileTypeSelect(props: FileTypeSelectProps) {
  const errorMessage = useSignal<string | null>(null);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    props.fileType.value = target.value as FileType;

    const { success, issues } = v.safeParse(
      v.pick(QrCodeSchema, ["fileType"]),
      {
        fileType: props.fileType.value,
      },
    );

    if (!success) {
      errorMessage.value = issues[0].message;
    } else {
      errorMessage.value = null;
    }
  };

  return (
    <label class="form-control w-full max-w-ss">
      <div class="label">
        <span class="label-text">File format:</span>
      </div>
      <select
        class="select select-primary select-sm w-full max-w-xs"
        name="fileType"
        aria-label="Select file type for QR Code"
        value={props.fileType.value}
        onChange={handleChange}
      >
        {Object.entries(FILE_TYPES).map(([key, value]) => (
          <option key={key} value={key}>{value.label}</option>
        ))}
      </select>

      {errorMessage.value && (
        <div class="label">
          <span class="label-text text-error">{errorMessage.value}</span>
        </div>
      )}
    </label>
  );
}

interface ColorInputProps {
  color: Signal<string>;
}

function ColorInput(props: ColorInputProps) {
  const errorMessage = useSignal<string | null>(null);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    props.color.value = target.value;

    const { success, issues } = v.safeParse(v.pick(QrCodeSchema, ["color"]), {
      color: props.color.value,
    });

    if (!success) {
      errorMessage.value = issues[0].message;
    } else {
      errorMessage.value = null;
    }
  };

  return (
    <label class="form-control">
      <div class="label">
        <span class="label-text">Color:</span>
      </div>
      <input
        type="color"
        class="input input-bordered input-sm input-primary w-full max-w-lg"
        value={props.color.value}
        onInput={handleChange}
      />
      {errorMessage.value && (
        <div class="label">
          <span class="label-text text-error">{errorMessage.value}</span>
        </div>
      )}
    </label>
  );
}
export function QrCodeForm(props: QrCodeFormProps) {
  const url = useSignal("");
  const fileType = useSignal<FileType>("image/png");
  const color = useSignal("#000000");
  const downloadable = useSignal(false);

  useSignalEffect(() => {
    const { success } = v.safeParse(QrCodeSchema, {
      url: url.value,
      fileType: fileType.value,
      color: color.value,
    });
    downloadable.value = success;
  });

  return (
    <div class={`flex flex-col-reverse md:flex-row gap-4 ${props.class ?? ""}`}>
      <QrCodeImage url={url} class="flex-1" />
      <div class="flex-1" aria-label="QR Code Form">
        <span class="text-4xl font-semibold">Generate QR Code</span>
        <div class="divider" />
        <div class="flex flex-col gap-4">
          <TabNav
            tabs={[
              { label: "Link", id: "url", component: <UrlInput url={url} /> },
              {
                label: "Color",
                id: "color",
                component: <ColorInput color={color} />,
              },
              {
                label: "File Format",
                id: "file",
                component: <FileTypeSelect fileType={fileType} />,
              },
            ]}
          />
          <button
            type="button"
            class={`btn btn-primary btn-sm rounded md:w-fit`}
            disabled={!downloadable.value || !IS_BROWSER}
            aria-disabled={!IS_BROWSER}
          >
            <Download class="size-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

interface QrCodeImageProps {
  url: Signal<string>;
  class?: string;
}

function QrCodeImage(props: QrCodeImageProps) {
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
    const currentUrl = props.url.value === ""
      ? PLACEHOLDER_URL
      : props.url.value;
    generateQr(currentUrl);
  });

  if (!qrCodeSrc.value) return null;

  return (
    <QrCodeImageContainer
      src={qrCodeSrc.value}
      class={props.class}
      isPlaceholder={props.url.value === "" || error.value !== null}
    />
  );
}
