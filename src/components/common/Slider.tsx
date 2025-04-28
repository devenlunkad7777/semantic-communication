import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center transition-colors">
          {label}
          {tooltip && (
            <div className="relative group ml-1">
              <span className="cursor-help rounded-full bg-gray-200 dark:bg-gray-700 px-1 text-xs">?</span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-md shadow-lg z-10">
                {tooltip}
              </div>
            </div>
          )}
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 transition-colors"
      />
    </div>
  );
};

export default Slider;