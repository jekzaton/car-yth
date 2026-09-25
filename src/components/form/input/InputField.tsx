import React, { forwardRef } from 'react';

interface InputProps {
  type?: React.HTMLInputTypeAttribute;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;

  className?: string;

  min?: string | number;
  max?: string | number;
  step?: string | number;

  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;

  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      id,
      name,
      placeholder,
      defaultValue,
      value,
      onChange,
      onBlur,
      onClick,
      className = '',
      min,
      max,
      step,
      disabled = false,
      success = false,
      error = false,
      hint,
      inputMode,
      autoComplete,
      maxLength,
    },
    ref,
  ) => {
    let inputClasses = `
      h-11 w-full rounded-lg border px-4 py-2.5 text-sm
      shadow-theme-xs placeholder:text-gray-400
      focus:outline-hidden focus:ring-3
      dark:bg-gray-900 dark:text-white/90
      dark:placeholder:text-white/30
      ${type === 'date' || type === 'time' ? 'cursor-pointer' : ''}
      ${className}
    `;

    if (disabled) {
      inputClasses +=
        ' cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400';
    } else if (error) {
      inputClasses +=
        ' border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800';
    } else if (success) {
      inputClasses +=
        ' border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:border-success-500 dark:focus:border-success-800';
    } else {
      inputClasses +=
        ' border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800';
    }

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(event);

      if (disabled) return;

      if (type === 'date' || type === 'time' || type === 'datetime-local') {
        try {
          event.currentTarget.showPicker?.();
        } catch {
          event.currentTarget.focus();
        }
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onClick={handleClick}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
        />

        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? 'text-error-500'
                : success
                  ? 'text-success-500'
                  : 'text-gray-500'
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
