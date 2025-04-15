import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Nova AI - Cosmic Guardian",
	description: "An AI guardian of cosmic energy tokens aboard the starship Celestial",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>


				{/* Add stars to the background */}
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				<div className="star"></div>
				{children}

			</body>
		</html>
	)
}
