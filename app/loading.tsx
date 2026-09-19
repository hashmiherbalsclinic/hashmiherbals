export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-6 py-16">
      <div className="h-8 w-48 rounded-lg bg-stone-200/80" />
      <div className="mt-3 h-4 w-72 max-w-full rounded bg-stone-100" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-stone-100" />
        ))}
      </div>
    </div>
  );
}
