"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
      <h1 className="font-serif-display mt-6 text-[36px] font-medium leading-tight">The fire flickered.</h1>
      <p className="mt-2 max-w-xs text-[16px]" style={{ color: "var(--ash)" }}>
        Something went wrong loading this page. It&apos;s usually temporary.
      </p>
      <button
        onClick={reset}
        className="btn btn-secondary mt-7"
      >
        Try again
      </button>
    </main>
  );
}
