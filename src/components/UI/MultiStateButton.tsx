import React from "react";
import { clsx } from "clsx";

type MultiStateButtonProps = {
  labels: [string, string];
  value?: boolean; // optional: controlled
  defaultValue?: boolean; // optional: uncontrolled
  onChange?: (value: boolean) => void;
};

export const MultiStateButton: React.FC<MultiStateButtonProps> = ({
  labels,
  value,
  defaultValue = true,
  onChange,
}) => {
  const [internalState, setInternalState] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const active = isControlled ? value : internalState;

  const handleToggle = () => {
    const newValue = !active;
    if (!isControlled) setInternalState(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="relative grid grid-cols-2 bg-indigo-50 rounded-3xl p-2 cursor-pointer w-fit">
      <button
        onClick={handleToggle}
        aria-pressed={active}
        className={`${
          active ? "text-white" : "text-indigo-400"
        } relative rounded-2xl px-4 p-2 text-xl font-semibold z-10 bg-transparent cursor-pointer transition-all duration-400 ease-in-out`}
      >
        {labels[0]}
      </button>
      <button
        onClick={handleToggle}
        aria-pressed={!active}
        className={`${
          !active ? "text-white" : "text-indigo-400"
        } relative rounded-2xl px-4 p-2 text-xl font-semibold z-10 bg-transparent cursor-pointer transition-all duration-400 ease-in-out`}
      >
        {labels[1]}
      </button>

      {/* Überarbeiteter span für die Animation */}
      <span
        className={clsx(
          `bg-indigo-400 absolute top-2 bottom-2 left-2 right-1/2 rounded-2xl transition-all duration-400 ease-in-out`,
          {
            "transform translate-x-0": active,
            "transform translate-x-full": !active,
          }
        )}
      />
    </div>

    // <div className="relative w-fit flex items-center gap-4 bg-indigo-50 rounded-full py-2 px-4">
    //   <button
    //     onClick={() => {
    //       if (!isControlled) setInternalState(false);
    //       onChange?.(false);
    //     }}
    //     aria-pressed={active}
    //     className={clsx(
    //       "w-20 h-10 rounded-full flex items-center justify-center z-10 cursor-pointer",
    //       {
    //         "text-white": active,
    //         "text-indigo-900": !active,
    //       }
    //     )}
    //   >
    //     {labels[0]}
    //   </button>
    //   <button
    //     onClick={handleToggle}
    //     aria-pressed={!active}
    //     className={clsx(
    //       "w-20 h-10 rounded-full flex items-center justify-center z-10 cursor-pointer",
    //       {
    //         "text-white": !active,
    //         "text-indigo-900": active,
    //       }
    //     )}
    //   >
    //     {labels[1]}
    //   </button>
    //   <div
    //     className={clsx(
    //       "absolute left-0 rounded-full h-10 bg-indigo-400 w-20 transition-all duration-300",
    //       !active ? "translate-x-28" : "translate-x-4"
    //     )}
    //   />
    // </div>
  );
};
