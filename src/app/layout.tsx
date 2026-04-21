import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fontSans = Inter({
	variable: "--font-sans",
	subsets: ["latin", "vietnamese"],
	display: "swap",
});

const fontMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin", "vietnamese"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Eisenhower Matrix",
	description:
		"Quản lý công việc theo triết lý Eisenhower — Urgent × Important.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="vi"
			className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col font-sans">
				{children}
				<Toaster richColors position="bottom-right" />
			</body>
		</html>
	);
}
