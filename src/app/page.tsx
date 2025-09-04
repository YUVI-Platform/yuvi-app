import Link from "next/link";
import { CourseLocationCard } from "../components/UI/Cards/LocationCards";

import { locations } from "@/testdata/locationData";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <main className="flex items-center justify-center h-screen max-h-[1000px] w-full gap-4 bg-[url(/landingpage-placeholder.avif)] bg-no-repeat bg-cover bg-center">
        <div className="flex flex-col justify-center items-center text-white bg-black/40 w-full h-full gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold text-center sm:text-left gelasio">
              Hi Athletes, we are Yuvi!
            </h1>
            <p className="text-2xl text-center sm:text-left">
              WE TURN (EMPTY) SPACES INTO URBAN MOVEMENT
            </p>
          </div>
          <Link
            href="/membership"
            className="text-lg text-white bg-indigo-400 font-bold py-2 px-4 rounded-2xl hover:bg-yuvi-rose transition-colors duration-300"
          >
            Start your journey!
          </Link>
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 my-24">
        {locations.map((loc) => (
          <CourseLocationCard
            key={loc.id}
            name={loc.name}
            address={loc.address}
            size={loc.size}
            availableFrom={loc.availableFrom}
            availableTo={loc.availableTo}
            features={loc.features}
            rating={loc.rating}
            imageUrl={loc.imageUrl}
          />
        ))}
      </section>

      <div className="flex flex-col items-center justify-center w-full max-w-[1000px] p-24">
        <h2 className="text-4xl font-bold text-center text-indigo-400">
          Sportwissen – von der Community, für die Community.
        </h2>
        <p>
          Über unsere digitale Infrastruktur vernetzen wir
          ImmobilieneigentümerInnen, TrainerInnen und AthletInnen miteinander
          indem wir ungenutzte urbane Flächen in flexible Boutique-Sportstudios
          verwandeln. Dadurch wollen wir jeder Person, ob mit oder ohne Studio,
          indoor oder outdoor, die Möglichkeit bieten, ihr sportliches Wissen
          frei zu entfalten, Menschen zu inspirieren und sich in einer
          dynamischen Community zu verwirklichen.
        </p>
      </div>
    </div>
  );
}
