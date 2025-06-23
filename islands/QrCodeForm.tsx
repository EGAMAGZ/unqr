import * as v from "@valibot/valibot";
import {
  FILE_TYPES,
  FileType,
  QrCodeSchema,
  validateColors,
} from "../schema/qr-code.ts";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import QrCodeGenerator from "qrcode";
import { PLACEHOLDER_URL } from "../util/constants.ts";
import { QrCodeImageContainer } from "../components/QrCodeImageContainer.tsx";
import { TabNav } from "./TabNav.tsx";
import { ColorInputField } from "./ColorInputField.tsx";
import { ShareButton } from "./ShareButton.tsx";
import { QrProvider, useQr } from "@/context/QrContext.tsx";
import { DownloadButton } from "./DownloadButton.tsx";

function UrlInput() {
  const { setUrl, qrData } = useQr();
  const errorMessage = useSignal<string | null>(null);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;

    const { success, issues, output } = v.safeParse(
      v.pick(QrCodeSchema, ["url"]),
      {
        url: target.value,
      },
    );

    errorMessage.value = !success ? issues[0].message : null;
    setUrl(!success ? "" : output.url);
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
        value={qrData.value.url}
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

function FileTypeSelect() {
  const { setFileType, qrData } = useQr();
  const errorMessage = useSignal<string | null>(null);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;

    const { success, issues, output } = v.safeParse(
      v.pick(QrCodeSchema, ["fileType"]),
      {
        fileType: target.value,
      },
    );

    errorMessage.value = !success ? issues[0].message : null;
    // FIXME: Valid type
    // @ts-ignore Unknown type when is already defined in the schema
    setFileType(output.fileType as FileType);
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
        value={qrData.value.fileType}
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

function ColorInputForm() {
  const { setPatternColor, setBackgroundColor, qrData } = useQr();
  const patternColorErrorMessage = useSignal<string | null>(null);
  const backgroundColorErrorMessage = useSignal<string | null>(null);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const isPatternColor = target.name === "patternColor";

    if (isPatternColor) {
      setPatternColor(target.value);
    } else {
      setBackgroundColor(target.value);
    }

    const { issues, success } = validateColors(
      qrData.value.patternColor,
      qrData.value.backgroundColor,
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
    <div class="flex gap-4">
      <ColorInputField
        label="Pattern Color"
        name="patternColor"
        color={qrData.value.patternColor}
        errorMessage={patternColorErrorMessage.value}
        onInput={handleInput}
      />
      <ColorInputField
        label="Background Color"
        name="backgroundColor"
        color={qrData.value.backgroundColor}
        errorMessage={backgroundColorErrorMessage.value}
        onInput={handleInput}
      />
    </div>
  );
}

interface QrCodeFormProps {
  class?: string;
}

export function QrCodeForm(props: QrCodeFormProps) {
  return (
    <QrProvider>
      <div
        class={`flex flex-col-reverse md:flex-row gap-4 ${props.class ?? ""}`}
      >
        <QrCodeImage />
        <div class="flex-1" aria-label="QR Code Form">
          <span class="text-4xl font-semibold">Generate QR Code</span>
          <div class="divider" />
          <div class="flex flex-col gap-4">
            <TabNav
              class="max-w-lg"
              tabs={[
                {
                  label: "Link",
                  id: "url",
                  component: <UrlInput />,
                },
                {
                  label: "Color",
                  id: "color",
                  component: <ColorInputForm />,
                },
                {
                  label: "File Format",
                  id: "file",
                  component: <FileTypeSelect />,
                },
              ]}
            />
            <div class="flex gap-4 justify-start">
              <DownloadButton />

              <ShareButton />
            </div>
          </div>
        </div>
      </div>
    </QrProvider>
  );
}

interface QrCodeImageProps {
  class?: string;
}

function QrCodeImage(props: QrCodeImageProps) {
  const { isValid, qrData } = useQr();
  const error = useSignal<string | null>(null);
  const qrCodeSrc = useSignal<string | null>(null);
  const isPlaceHolder = useComputed(() =>
    !isValid.value || error.value !== null
  );

  const generateQr = async (url: string) => {
    const { patternColor, backgroundColor } = qrData.value;
    try {
      const dataUrl = await QrCodeGenerator.toString(url, {
        type: "svg",
        color: {
          dark: patternColor,
          light: backgroundColor,
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
    const currentUrl = isValid.peek() ? qrData.value.url : PLACEHOLDER_URL;
    generateQr(currentUrl);
  });

  if (!qrCodeSrc.value) return null;

  return (
    <QrCodeImageContainer
      src={qrCodeSrc.value}
      class={props.class}
      isPlaceholder={isPlaceHolder.value}
    />
  );
}
