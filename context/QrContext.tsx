import { FileType, QrCode } from "@/schema/qr-code.ts";
import { Signal, signal, useComputed } from "@preact/signals";
import { ComponentChildren, createContext } from "preact";
import { useContext } from "preact/hooks";
import * as v from "@valibot/valibot";
import { QrCodeWithColorValidationSchema } from "../schema/qr-code.ts";
const QrContext = createContext<Signal<QrCode> | null>(null);
interface Props {
  children: ComponentChildren;
}
export function QrProvider(props: Props) {
  const qrData = signal<QrCode>({
    url: "",
    fileType: "image/png",
    patternColor: "#000000",
    backgroundColor: "#ffffff",
  });
  return (
    <QrContext.Provider value={qrData}>
      {props.children}
    </QrContext.Provider>
  );
}
export function useQr() {
  const ctx = useContext(QrContext);
  if (!ctx) throw new Error("useQr must be used within a QrProvider");
  const isValid = useComputed(
    () =>
      v.safeParse(
        QrCodeWithColorValidationSchema,
        { ...ctx.value },
      ).success,
  );
  const setUrl = (url: string) => {
    ctx.value = { ...ctx.value, url };
  };
  const setFileType = (fileType: FileType) => {
    ctx.value = { ...ctx.value, fileType };
  };
  const setPatternColor = (patternColor: string) => {
    ctx.value = { ...ctx.value, patternColor };
  };
  const setBackgroundColor = (backgroundColor: string) => {
    ctx.value = { ...ctx.value, backgroundColor };
  };
  return {
    setUrl,
    setFileType,
    setPatternColor,
    setBackgroundColor,
    qrData: ctx,
    isValid,
  };
}
