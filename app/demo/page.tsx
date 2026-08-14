import type { Metadata } from "next";
import { Demo } from "@/components/Demo";

export const metadata: Metadata = {
  title: "Try it · Refugio",
  description:
    "A no-install, web version of Refugio's core mechanic — add guardians, watch the fire grow, and feed it before it burns out.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <Demo />;
}
