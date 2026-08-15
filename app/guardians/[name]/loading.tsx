export default function Loading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-28 rounded-full" />
        <div className="skeleton h-11 w-16 rounded-full" />
      </div>
      <div className="mt-16 flex flex-col items-center">
        <div className="skeleton h-[84px] w-[84px] rounded-full" />
        <div className="skeleton mt-5 h-8 w-48 rounded-full" />
        <div className="skeleton mt-3 h-4 w-32 rounded-full" />
        <div className="skeleton mt-8 h-14 w-40 rounded-full" />
      </div>
    </main>
  );
}
