import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://refugio-azure.vercel.app"),
  title: "Wall of Guardians · Refugio",
  description:
    "The public leaderboard for Refugio — a Decentraland campfire that only burns when people show up. Embers earned keeping the fire alive.",
  openGraph: {
    title: "Wall of Guardians · Refugio",
    description:
      "Embers earned keeping the fire alive, in a Decentraland campfire that grows with the people present.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wall of Guardians · Refugio",
    description: "A Decentraland campfire that only burns when people show up.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
