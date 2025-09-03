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
    <div className="relative w-fit flex items-center gap-4 bg-indigo-50 rounded-full py-2 px-4">
      <button
        onClick={() => {
          if (!isControlled) setInternalState(false);
          onChange?.(false);
        }}
        aria-pressed={active}
        className={clsx(
          "w-20 h-10 rounded-full flex items-center justify-center z-10 cursor-pointer",
          {
            "text-white": active,
            "text-indigo-900": !active,
          }
        )}
      >
        {labels[0]}
      </button>
      <button
        onClick={handleToggle}
        aria-pressed={!active}
        className={clsx(
          "w-20 h-10 rounded-full flex items-center justify-center z-10 cursor-pointer",
          {
            "text-white": !active,
            "text-indigo-900": active,
          }
        )}
      >
        {labels[1]}
      </button>
      <div
        className={clsx(
          "absolute left-0 rounded-full h-10 bg-indigo-400 w-20 transition-all duration-300",
          !active ? "translate-x-28" : "translate-x-4"
        )}
      />
    </div>
  );
};
