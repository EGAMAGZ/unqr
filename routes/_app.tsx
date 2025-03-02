import { PageProps } from "$fresh/server.ts";

const SW_JS = `if('serviceWorker' in navigator){
     window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    });
}`;

export default function App({ Component }: PageProps) {
  return (
    <html data-theme="lofi" lang="en">
      <head>
        <title>UNQR</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <link
          rel="manifest"
          href="/manifest.json"
          crossorigin="use-credentials"
        />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="UNQR" />
        <link rel="stylesheet" href="/styles.css" />
        <script
          // deno-lint-ignore react-no-danger
          dangerouslySetInnerHTML={{ __html: SW_JS }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
