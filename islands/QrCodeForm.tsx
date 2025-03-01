import * as v from "@valibot/valibot";
import { QrCodeSchema } from "../schema/qr-code.ts";
import { Signal, useSignal, useSignalEffect } from "@preact/signals";
import Qr from "qrcode";
import { PLACEHOLDER_URL } from "../util/constants.ts";

export function QrCodeForm() {
  const url = useSignal(PLACEHOLDER_URL);

  return (
    <div class="flex">
      <QrCodeImg url={url.value} />
    </div>
  );
}

export function QrCodeImg(props: { url: string; class?: string }) {
  const error = useSignal<string | null>(null);
  const qrCodeSrc = useSignal<string | null>(null);
  const generateQr = async () => {
    try {
      const dataUrl = await Qr.toString(props.url, { type:"svg" });
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
        class={`border border-slate-300 bg-neutral-200 w-full p-6 rounded-xl ${
          props.class ?? ""
        }`}
	// deno-lint-ignore react-no-danger
	dangerouslySetInnerHTML= {{ __html: qrCodeSrc.value }}
      >
      </div>
    )
    : null;
}

/*
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
}*/
