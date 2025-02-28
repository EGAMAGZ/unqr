import { PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html data-theme="lofi">
      <head>
        <title>UnQr</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="container mx-auto">
          <Component />
        </div>
      </body>
    </html>
  );
}
