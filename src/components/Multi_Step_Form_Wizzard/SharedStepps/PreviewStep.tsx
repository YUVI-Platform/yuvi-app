import { Speaker, Star, Wifi } from "feather-icons-react";
import Image from "next/image";

export const SummaryStep = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-2xl font-bold ">Bitte überprüfe deine Eingaben.</h2>

      <div className="w-[500px] overflow-x-auto  overflow-box-scroll-hidden">
        <div className="flex gap-4 p-4 rounded-2xl min-w-max">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-44 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            >
              <Image
                src="/location-test-image.jpg"
                alt={`Preview ${index}`}
                width={176}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full mt-6 gap-16">
          <h3 className="text-3xl font-semibold gelasio">
            Yoga Kurs mit Robin
          </h3>
          <div className="flex items-center gap-1">
            <Star className="" fill="transparent" size={18} strokeWidth={1.5} />
            <Star className="" fill="transparent" size={18} strokeWidth={1.5} />
            <Star className="" fill="transparent" size={18} strokeWidth={1.5} />
            <Star className="" fill="transparent" size={18} strokeWidth={1.5} />
            <Star className="" fill="transparent" size={18} strokeWidth={1.5} />
          </div>
        </div>
        <div className="flex justify-between w-full gap-16">
          <div>
            <p className="text-sm">Yoga, Pilates, CrossFit.</p>
            <p className="text-sm">Yuvi Certified motion Expert</p>
            <p className="text-xs">1.3 km entfernt</p>
          </div>
          <div>
            <h3 className="font-semibold">Kurstermine</h3>
            <ul className="list-disc list-inside">
              <li>Mo. 20.03.25, 10:00 - 11:00 Uhr</li>
              <li>Mi. 22.03.25, 18:00 - 19:00 Uhr</li>
              <li>Fr. 24.03.25, 08:00 - 09:00 Uhr</li>
            </ul>
          </div>
        </div>
        <hr className="w-full h-0.5 border-0 rounded-full bg-yuvi-light-blue my-4" />
        <h3 className="font-semibold">Location Details</h3>
        <div className="w-[500px] overflow-x-auto  overflow-box-scroll-hidden">
          <div className="flex gap-4 p-4 rounded-2xl min-w-max">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-44 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <Image
                  src="/location-test-image.jpg"
                  alt={`Preview ${index}`}
                  width={176}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full h-1/2 overflow-hidden">
          <div className="flex items-center justify-between w-full mt-6 gap-16">
            <h3 className="font-semibold">Helles Loft</h3>
            <p>01.01.2024 - 31.12.2024</p>
          </div>
          <p>Musterstraße 123, 12345 Musterstadt</p>
          <p>100 m²</p>
          <div className="flex items-center gap-4">
            <Wifi className="" size={16} strokeWidth={2} />
            <Speaker className="" size={16} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};
