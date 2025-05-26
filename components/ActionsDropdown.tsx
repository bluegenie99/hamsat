import React, { useState, useRef, useEffect } from 'react';
import { SpecialAction } from '../types';
import { ACTION_BUTTONS_CONFIG } from '../constants';

interface ActionsDropdownProps {
  onActionSelect: (action: SpecialAction) => void;
  isDisabled: boolean;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ onActionSelect, isDisabled }) => {
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
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectAction = (action: SpecialAction) => {
    onActionSelect(action);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        disabled={isDisabled}
        className={`
          flex items-center justify-between px-4 py-2
          bg-white border border-pink-300 rounded-lg shadow-sm
          text-pink-600 hover:bg-pink-50 focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
          transition-all duration-150 ease-in-out
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center">
          <span className="ml-1">🔥</span>
          <span>طلبات خاصة</span>
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
        <div className="absolute z-10 left-0 mt-1 bg-white border border-pink-200 rounded-lg shadow-lg w-48 sm:w-56">
          <div className="py-1 max-h-60 overflow-auto">
            {ACTION_BUTTONS_CONFIG.map((btnConfig) => (
              <button
                key={btnConfig.action}
                onClick={() => handleSelectAction(btnConfig.action)}
                className="w-full px-4 py-2 text-right hover:bg-pink-50 text-gray-700"
              >
                {btnConfig.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;
