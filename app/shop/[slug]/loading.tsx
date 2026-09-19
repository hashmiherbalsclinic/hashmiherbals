export default function ProductLoading() {
  return (
    <div className="container-page animate-pulse py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-2xl bg-stone-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-lg bg-stone-200/80" />
          <div className="h-4 w-full rounded bg-stone-100" />
          <div className="h-4 w-5/6 rounded bg-stone-100" />
          <div className="mt-8 h-12 w-40 rounded-full bg-stone-200/70" />
        </div>
      </div>
    </div>
  );
}
