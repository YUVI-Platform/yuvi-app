import { use, useEffect, useState } from "react";

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

  const [pricingDetails, setPricingDetails] =
    useState<CoursePricingModellStepProps>({
      priceModel: "pricePerHour",
      price: null,
      percentage: null,
    });

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
      <div>
        <label htmlFor="">Modell</label>
        <select
          onChange={(e) => setPriceModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="pricePerHour">pro Stunde</option>
          <option value="pricePerSession">pro Session</option>
          <option value="percentage">Prozentsatz</option>
        </select>

        <label htmlFor="">Preis</label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="z.B. 10.00"
          onChange={(e) =>
            setPrice(e.target.value === "" ? null : parseFloat(e.target.value))
          }
        />
        {priceModel === "percentage" && (
          <>
            <label htmlFor="">Prozent Satz</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="z.B. 10.00"
              onChange={(e) => {
                setPercentage(
                  e.target.value === "" ? null : parseFloat(e.target.value)
                );
              }}
            />

            <div className="flex gap-4">
              <span>preis nach Prozent Satz:</span>
              <span>{priceByPercentage}</span>
            </div>
          </>
        )}
        <span>{percentage !== null ? percentage : 0} %,</span>
        <span>{price !== null ? price : 0}€</span>
      </div>
    </div>
  );
};
