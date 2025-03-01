import { QrCodeForm } from "../islands/QrCodeForm.tsx";
import { useSignal } from "@preact/signals";
import { PLACEHOLDER_URL } from "../util/constants.ts";

export default function Page() {
  return (
    <div class="p-4">
      <QrCodeForm />
    </div>
  );
}
