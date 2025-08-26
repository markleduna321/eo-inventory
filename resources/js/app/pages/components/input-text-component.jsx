import React from 'react';

const InputTextComponent = ({ 
  id, 
  name, 
  type = "text", 
  required = false, 
  autoComplete, 
  placeholder, 
  onChange, 
  value, 
  label, 
  min, 
  max, 
  step, 
  readOnly = false,
  disabled = false,
  className = "",
  ...rest 
}) => {
  const baseClassName = "block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  const finalClassName = `${baseClassName} ${className}`.trim();

  return (
    <div className="mt-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          id={id}
          value={value}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          readOnly={readOnly}
          disabled={disabled}
          className={finalClassName}
          placeholder={placeholder} // Optional placeholder
          onChange={onChange}
          {...rest}
        />
      </div>
    </div>
  );
};

export default InputTextComponent;
