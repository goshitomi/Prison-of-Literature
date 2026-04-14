import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title:       "Prison of Literature — 수감자 명부",
  description: "국립중앙도서관 소장 도서를 교도소 수감자 명부 형식으로 열람하는 아카이브. Prison of Literature (책은 죄수다).",
  keywords:    ["Prison of Literature", "책은 죄수다", "국립중앙도서관", "NLK", "도서 아카이브"],
  openGraph: {
    title:       "Prison of Literature",
    description: "책은 죄수다 — 국립중앙도서관 오픈 API 기반 도서 명부",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <div className="page-body">{children}</div>
      </body>
    </html>
  );
}
