interface Props {
  src: string;
  class?: string;
  isPlaceholder: boolean;
}

export function QrCodeImageContainer(props: Props) {
  return (
    <div
      class={`border border-slate-300 bg-neutral-200 w-full p-6 rounded-xl flex justify-center items-center qr-size  ${
        props.class ?? ""
      } ${props.isPlaceholder ? "qr-disabled qr-bg-transparent" : ""}`}
      aria-label="QR Code Display"
      // deno-lint-ignore react-no-danger
      dangerouslySetInnerHTML={{ __html: props.src }}
    />
  );
}
