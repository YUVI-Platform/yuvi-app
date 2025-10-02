export const StudioRulesStep = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl">Studio Regeln</h1>
      <textarea
        placeholder="Gib hier die Regeln für dein Studio ein..."
        className="border-2 p-2 rounded-xl border-indigo-100 w-full h-48"
      />
      <p className="text-sm text-gray-500">Check In Infos einfügen.</p>
      <p className="text-sm text-gray-500">Parkmöglichkeiten einfügen.</p>
      <p className="text-sm text-gray-500">
        Zeit Management in die Zeit einrechnen (Ankommen, Umziehen, etc.)
      </p>
    </div>
  );
};
