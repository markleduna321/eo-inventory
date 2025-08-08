import React from 'react';

const Modal = ({ isOpen, onClose, children, width = 'w-1/2' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-hidden">
      <div className={`flex flex-col bg-white rounded-lg shadow-lg ${width} max-h-[95vh] min-w-fit max-w-[95vw] relative`}>
        <button
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="overflow-hidden flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
