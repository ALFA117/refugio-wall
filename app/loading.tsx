// Shown while the dynamic home route resolves its leaderboard fetch — a real loading moment
// (unlike the game's own state, which never blocks on network), so a themed skeleton earns
// its place here instead of being a fake state.
export default function Loading() {
  return (
    <>
      <div className="h-16 border-b" style={{ borderColor: "var(--line)" }} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6" aria-busy="true">
        <div className="grid gap-10 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-24">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="skeleton h-7 w-48 rounded-full" />
            <div className="skeleton h-16 w-full max-w-md rounded-lg" />
            <div className="skeleton h-16 w-3/4 max-w-sm rounded-lg" />
            <div className="skeleton mt-2 h-5 w-full max-w-xl rounded" />
            <div className="skeleton h-12 w-56 rounded-[10px]" />
          </div>
          <div className="skeleton h-80 rounded-[14px] lg:col-span-5" />
        </div>
        <div className="skeleton mt-24 h-10 w-56 rounded-lg" />
        <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-[14px]">
          <div className="skeleton h-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      </main>
    </>
  );
}
