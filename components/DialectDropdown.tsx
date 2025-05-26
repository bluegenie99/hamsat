import React, { useState, useRef, useEffect } from 'react';
import { Dialect, DIALECT_OPTIONS } from '../types';

interface DialectDropdownProps {
  selectedDialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  isLoading: boolean;
}

const DialectDropdown: React.FC<DialectDropdownProps> = ({ selectedDialect, onDialectChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectDialect = (dialect: Dialect) => {
    onDialectChange(dialect);
    setIsOpen(false);
  };

  // Find the current dialect label
  const currentDialectLabel = DIALECT_OPTIONS.find(option => option.value === selectedDialect)?.label || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className={`
          flex items-center justify-between w-full px-4 py-2 
          bg-white border border-pink-300 rounded-lg shadow-sm
          text-pink-600 hover:bg-pink-50 focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
          transition-all duration-150 ease-in-out
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center">
          <span className="mr-2">🗣️</span>
          <span>{currentDialectLabel}</span>
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-pink-200 rounded-lg shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {DIALECT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectDialect(option.value)}
                className={`
                  w-full px-4 py-2 text-right hover:bg-pink-50 
                  ${selectedDialect === option.value ? 'bg-pink-100 text-pink-700 font-medium' : 'text-gray-700'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DialectDropdown;
