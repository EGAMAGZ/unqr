// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_app from "./routes/_app.tsx";
import * as $index from "./routes/index.tsx";
import * as $ColorInput from "./islands/ColorInput.tsx";
import * as $QrCodeForm from "./islands/QrCodeForm.tsx";
import * as $TabNav from "./islands/TabNav.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_app.tsx": $_app,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/ColorInput.tsx": $ColorInput,
    "./islands/QrCodeForm.tsx": $QrCodeForm,
    "./islands/TabNav.tsx": $TabNav,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
