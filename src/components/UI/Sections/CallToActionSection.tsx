import Link from "next/link";

export default function CallToActionSection() {
  return (
    <section className="flex flex-col items-center justify-center w-full max-w-[1000px] p-4 md:p-24 gap-8">
      <h2 className="text-4xl text-center text-indigo-400">
        Join the Movement
      </h2>
      <p className="text-center text-slate-800">
        Werde Teil unserer Community und gestalte die Zukunft des Sports mit
        uns. Egal, ob als Motion Expert:in, Athlet:in oder Studiohost –
        gemeinsam schaffen wir neue Räume für Bewegung und Inspiration.
      </p>

      <Link
        href="/membership"
        className="text-lg text-white bg-indigo-400 font-bold py-2 px-4 rounded-2xl hover:bg-yuvi-rose transition-colors duration-300"
      >
        Jetzt Teil der YUVI Familie werden!
      </Link>
    </section>
  );
}
