// Shown while the dynamic home route resolves its leaderboard fetch — a real loading moment
// (unlike the game's own state, which never blocks on network), so a themed skeleton earns
// its place here instead of being a fake state.
export default function Loading() {
  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-3xl px-5 pb-24 pt-14 sm:pt-20">
      <div className="mx-auto mt-16 flex flex-col items-center gap-3">
        <div className="skeleton h-3 w-40 rounded-full" />
        <div className="skeleton mt-3 h-11 w-64 rounded-full" />
        <div className="skeleton h-3 w-72 rounded-full" />
      </div>
      <div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-4">
        <div className="skeleton h-40 rounded-2xl" style={{ marginTop: 24 }} />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" style={{ marginTop: 32 }} />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
