import { cx } from 'class-variance-authority';
import { useMemo } from 'react';

interface SliderProps {
  ref?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider = ({ ref, className, min, max, step, value, onChange }: SliderProps) => {
  const filledSliderStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, var(--color-emerald-500) 0% ${(value / max) * 100}%, var(--color-gray-600) ${(value / max) * 100}% 100%)`,
    }),
    [value, max],
  );

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={filledSliderStyle}
      className={cx(
        'h-1 w-full cursor-pointer appearance-none rounded-full text-white outline-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:outline-0 [&::-webkit-slider-thumb]:outline-offset-0 [&::-webkit-slider-thumb]:outline-transparent [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150 focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-current',
        className,
      )}
    />
  );
};

export default Slider;
