import * as v from "@valibot/valibot";

export const QrCodeSchema = v.required(
  v.object({
    url: v.pipe(
      v.string("Url no es un string"),
      v.url("Formato de URL invalido"),
    ),
  }),
);
