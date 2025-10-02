import Link from "next/link";

export const SelfHostedLocationStep = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl">Wo finden deine Sessions statt?</h1>
      <input
        type="text"
        placeholder="Location Name"
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
      />
      <input
        type="text"
        placeholder="Gib die Adresse deines Studios ein..."
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
      />
      <div>
        <label htmlFor="indoor" className="mt-4">
          Indoor Session
          <input type="checkbox" id="indoor" className="mt-4" />
        </label>
        <label htmlFor="outdoor" className="mt-4">
          Outdoor Session
        </label>
        <input type="checkbox" id="outdoor" className="mt-4" />
      </div>
      <input
        type="number"
        placeholder="Maximale Teilnehmerzahl"
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
      />
      <label htmlFor="AGB" className="mt-4">
        Ich akzeptiere die{" "}
        <Link href="/" className="text-blue-500 underline font-bold">
          AGBs
        </Link>{" "}
        und die damit verbundene Stornierungs richtlinien
        <input type="checkbox" id="AGB" className="mt-4" />
      </label>
      <p>TODO: MAP OPTION HINZUFÜGEN</p>
    </div>
  );
};
