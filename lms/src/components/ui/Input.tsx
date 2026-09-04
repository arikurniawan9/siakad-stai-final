import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorMessage,
  className = '',
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${errorMessage ? 'error' : ''} ${className}`}
        {...props}
      />
      {errorMessage ? (
        <span className="form-error-msg">{errorMessage}</span>
      ) : (
        helperText && <span className="form-helper">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
