import { ReactNode } from "react";

import "./globals.css";

import { kumbhSans, inter } from "./fonts";

type Props = Readonly<{ children: ReactNode }>

export default function RootLayout({ children }: Props) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <title>Droksd</title>
      </head>
      <body className={`${inter.variable} ${kumbhSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
