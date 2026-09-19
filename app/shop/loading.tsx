export default function ShopLoading() {
  return (
    <div className="container-page animate-pulse py-10 sm:py-14">
      <div className="h-9 w-36 rounded-lg bg-stone-200/80" />
      <div className="mt-3 h-4 w-64 rounded bg-stone-100" />
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-stone-100" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-stone-100" />
        ))}
      </div>
    </div>
  );
}
