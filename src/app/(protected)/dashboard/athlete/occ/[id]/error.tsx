"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-rose-50 p-4 text-rose-800">
      <div className="text-sm font-semibold">Fehler</div>
      <div className="text-sm mt-1">{error.message}</div>
    </div>
  );
}
