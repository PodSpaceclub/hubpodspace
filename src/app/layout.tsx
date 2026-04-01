import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PodSpace Club - Hub de Parceiros",
  description:
    "Marketplace premium conectando parceiros ao universo dos podcasts",
  keywords: ["podcast", "studio", "marketplace", "parceiros", "podspace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* CSS failure detection: reloads page once if Tailwind failed to load */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){window.addEventListener('load',function(){if(sessionStorage.getItem('css_ok'))return;var d=document.createElement('div');d.className='hidden';document.body.appendChild(d);var ok=window.getComputedStyle(d).display==='none';document.body.removeChild(d);if(ok){sessionStorage.setItem('css_ok','1');}else if(!sessionStorage.getItem('css_retry')){sessionStorage.setItem('css_retry','1');location.reload(true);}});})();`
        }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
