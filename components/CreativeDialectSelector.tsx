import React, { useState } from 'react';
import { Dialect, DIALECT_OPTIONS } from '../types';
import ExpandableButtonGroup from './ExpandableButtonGroup';

interface CreativeDialectSelectorProps {
  selectedDialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
  isLoading: boolean;
}

const CreativeDialectSelector: React.FC<CreativeDialectSelectorProps> = ({
  selectedDialect,
  onDialectChange,
  isLoading
}) => {
  // State to control the expanded state of the dropdown
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find the current dialect label
  const currentDialectLabel = DIALECT_OPTIONS.find(option => option.value === selectedDialect)?.label || '';
  
  // Handler for dialect change that also closes the dropdown
  const handleDialectChange = (dialect: Dialect) => {
    onDialectChange(dialect);
    setIsExpanded(false); // Close the dropdown after selection
  };

  return (
    <ExpandableButtonGroup
      icon={<span className="text-xl">🗣️</span>}
      label={`اللهجة: ${currentDialectLabel}`}
      position="right"
      direction="horizontal"
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {DIALECT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleDialectChange(option.value)}
            disabled={isLoading}
            className={`
              px-3 py-2 text-sm rounded-lg
              transition-all duration-200 ease-in-out
              border
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
              transform hover:scale-105
              ${selectedDialect === option.value
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-md'
                : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50 hover:border-pink-400'
              }
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </ExpandableButtonGroup>
  );
};

export default CreativeDialectSelector;
