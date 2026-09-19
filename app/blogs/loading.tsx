export default function PageLoading() {
  return (
    <div className="container-page animate-pulse py-14">
      <div className="h-4 w-40 rounded bg-stone-100" />
      <div className="mt-3 h-10 w-48 rounded-lg bg-stone-200/80" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] rounded-2xl bg-stone-100" />
            <div className="h-5 w-3/4 rounded bg-stone-200/70" />
            <div className="h-4 w-full rounded bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
