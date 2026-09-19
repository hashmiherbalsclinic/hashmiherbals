export default function PageLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-6 py-16">
      <div className="mx-auto h-6 w-40 rounded-full bg-stone-100" />
      <div className="mx-auto mt-6 h-10 w-72 max-w-full rounded-lg bg-stone-200/80" />
      <div className="mx-auto mt-4 h-4 w-full max-w-md rounded bg-stone-100" />
      <div className="mt-12 space-y-4">
        <div className="h-40 rounded-2xl bg-stone-100" />
        <div className="h-40 rounded-2xl bg-stone-100" />
      </div>
    </div>
  );
}
