import type { Metadata } from "next";
import type { ReactNode } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import "./integration.css";

export const metadata: Metadata = {
  title: "防災疑似体験 | Disaster Simulation",
  description: "自分の生活圏で災害と避難判断を追体験する平時の防災訓練アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
