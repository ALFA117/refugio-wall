import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5 text-center">
      <div
        className="rounded-full"
        style={{
          width: 64,
          height: 64,
          background: "radial-gradient(circle at 35% 30%, rgba(255,214,107,0.4), rgba(255,122,45,0.15) 72%)",
          border: "1px solid var(--line)",
        }}
      />
      <h1 className="font-serif-display mt-6 text-3xl font-semibold tracking-tight">This ember burned out.</h1>
      <p className="mt-2 max-w-xs text-[14px]" style={{ color: "var(--ash)" }}>
        There&apos;s nothing here. The fire&apos;s still going back at the Wall.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex min-h-11 items-center gap-1.5 rounded-full border px-5 text-[14px] font-medium transition-colors hover:text-[var(--warm-white)]"
        style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
      >
        Back to the Wall
      </Link>
    </main>
  );
}
