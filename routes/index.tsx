import { QrCodeForm } from "../islands/QrCodeForm.tsx";
import { Navbar } from "../components/Navbar.tsx";

export default function Page() {
  return (
    <div class="p-4 flex flex-col gap-6">
      <Navbar />
      <QrCodeForm />
    </div>
  );
}
