export default function Loading() {
  return (
    <div className="mx-auto max-w-md animate-pulse">
      <div className="aspect-[16/9] rounded-2xl bg-slate-100" />
      <div className="mt-4 h-4 w-40 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-72 rounded bg-slate-100" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-16 rounded bg-slate-100" />
        <div className="h-16 rounded bg-slate-100" />
      </div>
    </div>
  );
}
