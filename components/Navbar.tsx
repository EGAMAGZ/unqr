import { Github } from "./icons/Github.tsx";
import { QrCode as IconQrcode } from "./icons/QrCode.tsx";

interface Props {
  class?: string;
}

export function Navbar(props: Props) {
  return (
    <nav
      class={`navbar bg-primary text-primary-content px-4 rounded-xl ${
        props.class ?? ""
      }`}
    >
      <div class="flex-1">
        <IconQrcode />
        <span class="font-bold text-lg">UNQR</span>
        <span class="text-xs italic">
          Códigos QR fáciles de usar: ¡copiar, pegar, generar y listo!
        </span>
      </div>
      <div class="flex-none">
        <a
          href="https://github.com/EGAMAGZ/unqr"
          target="_blank"
          class="btn btn-ghost btn-circle"
        >
          <Github />
        </a>
      </div>
    </nav>
  );
}
