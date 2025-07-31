import React, { useState, useEffect } from 'react';

export default function SelectComponent({ id, name, value, onChange, options, required, allowCustomValue = false }) {
  const [customValue, setCustomValue] = useState('');
  const [isCustomValue, setIsCustomValue] = useState(false);

  // Check if the current value exists in options
  useEffect(() => {
    if (allowCustomValue && value && options && options.length > 0) {
      const valueExists = options.some(option => option.value === value);
      setIsCustomValue(!valueExists && value !== '');
      if (!valueExists && value !== '') {
        setCustomValue(value);
      }
    }
  }, [value, options, allowCustomValue]);

  // Handle custom value input change
  const handleCustomValueChange = (e) => {
    setCustomValue(e.target.value);
    // Create a synthetic event to match the onChange from the select
    const syntheticEvent = {
      target: {
        name: name,
        value: e.target.value
      }
    };
    onChange(syntheticEvent);
  };

  // Handle select change
  const handleSelectChange = (e) => {
    if (e.target.value === '__custom__') {
      setIsCustomValue(true);
    } else {
      setIsCustomValue(false);
      onChange(e);
    }
  };

  return (
    <>
      {!isCustomValue ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={handleSelectChange}
          required={required}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select --</option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
              disabled={option.disabled}
              style={option.disabled ? {
                backgroundColor: '#f3f4f6',
                color: '#9ca3af',
                fontStyle: 'italic'
              } : {}}
            >
              {option.label}
            </option>
          ))}
          {allowCustomValue && <option value="__custom__">-- Custom Value --</option>}
        </select>
      ) : (
        <div className="flex items-center">
          <input
            type="text"
            id={`${id}_custom`}
            name={name}
            value={customValue}
            onChange={handleCustomValueChange}
            required={required}
            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter custom value"
          />
          <button
            type="button"
            onClick={() => setIsCustomValue(false)}
            className="ml-2 p-2 text-gray-400 hover:text-gray-600"
            aria-label="Return to select"
          >
            ↩
          </button>
        </div>
      )}
    </>
  );
}
