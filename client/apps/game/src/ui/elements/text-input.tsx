import clsx from "clsx";
import React from "react";

interface TextInputProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  onKeyDown?: (e: any) => void;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { disabled, onChange, className, placeholder, maxLength, onBlur, onFocus, onKeyDown } = props;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        (e.target as any).reset();
      }}
      className={clsx(
        "w-full transition-all duration-300 focus:outline-none border-opacity-50 focus:border-opacity-100 placeholder-white/25 flex-grow bg-transparent border border-gold/40 rounded-lg",
        className,
      )}
    >
      <input
        ref={ref}
        autoFocus={true}
        className={clsx(
          "w-full p-2 h-full text-gold  transition-all duration-300 focus:outline-none border-opacity-50 focus:border-opacity-100 placeholder:text-gold flex-grow bg-transparent font-bold",
        )}
        disabled={disabled || false}
        type="text"
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={(e) => {
          e.stopPropagation(); // Prevent key events from propagating
          if (onKeyDown) onKeyDown(e);
        }}
        autoComplete="off"
      />
    </form>
  );
});

export default TextInput;