import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5 text-center">
      <div
        className="rounded-2xl"
        style={{
          width: 64,
          height: 64,
          background: "var(--surface-2)",
          border: "1px solid var(--line-strong)",
        }}
      />
      <h1 className="font-serif-display mt-6 text-[36px] font-medium leading-tight">This ember burned out.</h1>
      <p className="mt-2 max-w-xs text-[16px]" style={{ color: "var(--ash)" }}>
        There&apos;s nothing here. The fire&apos;s still going back at the Wall.
      </p>
      <Link
        href="/"
        className="btn btn-secondary mt-7"
      >
        Back to the Wall
      </Link>
    </main>
  );
}
