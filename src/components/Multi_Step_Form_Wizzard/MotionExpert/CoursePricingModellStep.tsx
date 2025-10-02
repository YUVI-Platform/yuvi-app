// import { use, useEffect, useState } from "react";
import { number } from "framer-motion";
import { EuroIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface CoursePricingModellStepProps {
  priceModel: string;
  price: number | null;
  percentage?: number | null;
}

export const CoursePricingModellStep = () => {
  const [priceModel, setPriceModel] = useState("pricePerHour");
  const [price, setPrice] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [priceByPercentage, setPriceByPercentage] = useState<number | null>(
    null
  );

  // const [pricingDetails, setPricingDetails] =
  //   useState<CoursePricingModellStepProps>({
  //     priceModel: "pricePerHour",
  //     price: null,
  //     percentage: null,
  //   });

  const handleSetPercentage = (value: number, price: number | null) => {
    if (price !== null) {
      const newPercentage = price * (value / 100);
      setPriceByPercentage(newPercentage);
    }
  };

  useEffect(() => {
    if (percentage !== null) {
      handleSetPercentage(percentage, price);
    }
  }, [price, percentage]);

  return (
    <div className="flex flex-col gap-8 justify-center">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Bitte wähle ein Preismodell.
      </h2>
      <div className="flex  flex-col gap-4 justify-center items-center">
        <label htmlFor="">Modell</label>
        <div className="flex gap-4 w-fit">
          <input
            type="number"
            className="flex w-full"
            placeholder="Preis pro Session"
          />
          <EuroIcon className="" />
        </div>
      </div>

      <label htmlFor="AGB" className="mt-4">
        Ich akzeptiere die{" "}
        <Link href="/" className="text-blue-500 underline font-bold">
          AGBs
        </Link>{" "}
        und die damit verbundene Stornierungs richtlinien
        <input type="checkbox" id="AGB" className="mt-4" />
      </label>
    </div>
  );
};
