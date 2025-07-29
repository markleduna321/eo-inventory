import React from 'react';

const Modal = ({ isOpen, onClose, children, width = 'w-1/2' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden">
      <div className={`flex flex-col bg-white p-6 rounded-lg shadow-lg ${width} max-h-[90vh] min-w-fit relative`}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        <div className="overflow-y-auto pr-2 max-h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
