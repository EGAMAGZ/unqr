import * as v from "@valibot/valibot";
import { QrCodeSchema } from "../schema/qr-code.ts";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import Qr from "qrcode";

export function QrCodeForm() {
  const url = useSignal<string | null>(null);
  return (
    <div>
      {url.value ? <QrCode url={url} /> : <UrlForm url={url} />}
    </div>
  );
}

function UrlForm({ url }: { url: Signal<string | null> }) {
  const error = useSignal<string | null>(null);
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, issues, output } = v.safeParse(
      QrCodeSchema,
      Object.fromEntries(formData.entries()),
    );
    if (!success) {
      error.value = issues[0].message;
      return;
    }
    error.value = null;
    url.value = output.url;
  };
  return (
    <form onSubmit={handleSubmit} class="join w-full flex flex-col">
      <div class="flex">
        <input
          type="text"
          name="url"
          class="input input-sm input-primary join-item flex-1"
        />
        <button type="submit" class="btn btn-sm btn-primary join-item">
          Generar
        </button>
      </div>
      {error}
    </form>
  );
}
function QrCode({ url }: { url: Signal<string | null> }) {
  const qrCodeSrc = useSignal<string | null>(null);
  const error = useSignal<string | null>(null);

  const generateQr = async () => {
    try {
      const dataUrl = await Qr.toDataURL(url.value);
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

  if (error.value) {
    return <div>{error.value}</div>;
  }

  return qrCodeSrc.value
    ? (
      <div>
        <img src={qrCodeSrc.value} />
        <div class="flex gap-2">
          <button
            type="button"
            onClick={() => {
              qrCodeSrc.value = null;
              url.value = null;
            }}
          >
            Descartar
          </button>

          <button type="button">
            Descargar
          </button>
        </div>
      </div>
    )
    : null;
}
