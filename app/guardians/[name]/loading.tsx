// Same frame as the profile it stands in for: breadcrumb, monogram + name, then the facts band.
export default function Loading() {
  return (
    <>
      <div className="h-16 border-b" style={{ borderColor: "var(--line)" }} />
      <main className="page pb-24 pt-8 sm:pt-12" aria-busy="true">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="mt-8 flex items-center gap-5">
          <div className="skeleton h-[72px] w-[72px] rounded-2xl" />
          <div className="flex flex-col gap-3">
            <div className="skeleton h-6 w-44 rounded-full" />
            <div className="skeleton h-10 w-64 max-w-[60vw] rounded-lg" />
          </div>
        </div>
        <div className="skeleton mt-8 h-48 rounded-[14px]" />
      </main>
    </>
  );
}
