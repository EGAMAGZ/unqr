import * as v from "@valibot/valibot";
import {
  FILE_TYPES,
  FileType,
  QrCodeSchema,
  QrCodeWithColorValidationSchema,
  validateColors,
} from "../schema/qr-code.ts";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import QrCodeGenerator from "qrcode";
import { PLACEHOLDER_URL } from "../util/constants.ts";
import { Download } from "../components/icons/Download.tsx";
import { generateImageBlob } from "../util/image.ts";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";
import { QrCodeImageContainer } from "../components/QrCodeImageContainer.tsx";
import { TabNav } from "./TabNav.tsx";
import { ColorInputField } from "../components/ColorSelector.tsx";

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
  patternColor: Signal<string>;
  backgroundColor: Signal<string>;
}

function ColorInput(props: ColorInputProps) {
  const patternColorErrorMessage = useSignal<string | null>(null);
  const backgroundColorErrorMessage = useSignal<string | null>(null);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const isPatternColor = target.name === "patternColor";

    if (isPatternColor) {
      props.patternColor.value = target.value;
    } else {
      props.backgroundColor.value = target.value;
    }

    const { issues, success } = validateColors(
      props.patternColor.value,
      props.backgroundColor.value,
    );

    if (!success) {
      issues.forEach((issue) => {
        const path = v.getDotPath(issue);
        if (path === "backgroundColor") {
          backgroundColorErrorMessage.value = issue.message;
          patternColorErrorMessage.value = null;
        } else {
          patternColorErrorMessage.value = issue.message;
          backgroundColorErrorMessage.value = null;
        }
      });
    } else {
      patternColorErrorMessage.value = null;
      backgroundColorErrorMessage.value = null;
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <ColorInputField
        label="Pattern Color"
        name="patternColor"
        color={props.patternColor}
        errorMessage={patternColorErrorMessage.value}
        onInput={handleInput}
      />
      <ColorInputField
        label="Background Color"
        name="backgroundColor"
        color={props.backgroundColor}
        errorMessage={backgroundColorErrorMessage.value}
        onInput={handleInput}
      />
    </div>
  );
}

export function QrCodeForm(props: QrCodeFormProps) {
  const url = useSignal("");
  const fileType = useSignal<FileType>("image/png");
  const patternColor = useSignal("#000000");
  const backgroundColor = useSignal("#ffffff");
  const downloadable = useSignal(false);

  useSignalEffect(() => {
    const { success } = v.safeParse(
      QrCodeWithColorValidationSchema,
      {
        url: url.value,
        fileType: fileType.value,
        patternColor: patternColor.value,
        backgroundColor: backgroundColor.value,
      },
    );
    downloadable.value = success;
  });

  const downloadCode = async () => {
    if (url.value) {
      const blobURL = URL.createObjectURL(
        await generateImageBlob(
          fileType.value,
          url.value,
          patternColor.value,
          backgroundColor.value,
        ),
      );
      const extension = FILE_TYPES[fileType.value].extension;

      const linkElement = document.createElement("a");
      linkElement.href = blobURL;
      linkElement.download = `unqr-code.${extension}`;
      linkElement.click();

      URL.revokeObjectURL(blobURL);
      linkElement.remove();
    }
  };

  return (
    <div class={`flex flex-col-reverse md:flex-row gap-4 ${props.class ?? ""}`}>
      <QrCodeImage
        url={url}
        patternColor={patternColor}
        backgroundColor={backgroundColor}
        class="flex-1"
      />
      <div class="flex-1" aria-label="QR Code Form">
        <span class="text-4xl font-semibold">Generate QR Code</span>
        <div class="divider" />
        <div class="flex flex-col gap-4">
          <TabNav
            class="max-w-lg"
            tabs={[
              { label: "Link", id: "url", component: <UrlInput url={url} /> },
              {
                label: "Color",
                id: "color",
                component: (
                  <ColorInput
                    patternColor={patternColor}
                    backgroundColor={backgroundColor}
                  />
                ),
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
            onClick={downloadCode}
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
  patternColor: Signal<string>;
  backgroundColor: Signal<string>;
  class?: string;
}

function QrCodeImage(props: QrCodeImageProps) {
  const error = useSignal<string | null>(null);
  const qrCodeSrc = useSignal<string | null>(null);
  const generateQr = async (url: string) => {
    try {
      const dataUrl = await QrCodeGenerator.toString(url, {
        type: "svg",
        color: {
          dark: props.patternColor.value,
          light: props.backgroundColor.value,
        },
      });
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
