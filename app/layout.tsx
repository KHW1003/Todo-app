import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "할 일 목록",
};

// 모든 페이지를 감싸는 기본 틀
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
