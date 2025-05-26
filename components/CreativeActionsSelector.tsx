import React, { useState } from 'react';
import { SpecialAction } from '../types';
import { ACTION_BUTTONS_CONFIG } from '../constants';
import ExpandableButtonGroup from './ExpandableButtonGroup';

interface CreativeActionsSelectorProps {
  onActionSelect: (action: SpecialAction) => void;
  isDisabled: boolean;
}

const CreativeActionsSelector: React.FC<CreativeActionsSelectorProps> = ({
  onActionSelect,
  isDisabled
}) => {
  // State to control the expanded state of the dropdown
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handler for action selection that also closes the dropdown
  const handleActionSelect = (action: SpecialAction) => {
    onActionSelect(action);
    setIsExpanded(false); // Close the dropdown after selection
  };
  return (
    <ExpandableButtonGroup
      icon={<span className="text-xl">🔥</span>}
      label="طلبات خاصة"
      position="left"
      direction="vertical"
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
    >
      <div className="flex flex-col gap-2 w-full min-w-[200px]">
        {ACTION_BUTTONS_CONFIG.map((btnConfig) => (
          <button
            key={btnConfig.action}
            onClick={() => handleActionSelect(btnConfig.action)}
            disabled={isDisabled}
            className={`
              px-4 py-2.5 text-right rounded-lg
              transition-all duration-200 ease-in-out
              border border-pink-300
              bg-white text-pink-600 hover:bg-pink-50
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1
              transform hover:scale-105 hover:shadow-md
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-between
            `}
          >
            <span>{btnConfig.label}</span>
            <span className="text-xl">✨</span>
          </button>
        ))}
      </div>
    </ExpandableButtonGroup>
  );
};

export default CreativeActionsSelector;
