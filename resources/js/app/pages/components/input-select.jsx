import React from 'react';

export default function SelectComponent({ id, name, value, onChange, options, required }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="">-- Select --</option> {/* Optional default placeholder */}
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
    </select>
  );
}
