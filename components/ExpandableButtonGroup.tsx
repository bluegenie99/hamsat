import React, { useState } from 'react';

interface ExpandableButtonGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  position?: 'left' | 'right';
  isExpanded?: boolean;
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExpandableButtonGroup: React.FC<ExpandableButtonGroupProps> = ({ 
  icon, 
  label, 
  children,
  direction = 'horizontal',
  position = 'right',
  isExpanded: externalIsExpanded,
  setIsExpanded: externalSetIsExpanded
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  
  // Determine which state and setter to use
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = externalSetIsExpanded || setInternalIsExpanded;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Function to close the dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore - target is not recognized as HTMLElement
      const target = event.target as HTMLElement;
      // Check if the click is outside the dropdown
      if (isExpanded && !target.closest('.expandable-button-group')) {
        setIsExpanded(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, setIsExpanded]);

  return (
    <div className="relative expandable-button-group">
      {/* Main toggle button */}
      <button
        onClick={toggleExpand}
        className={`
          flex items-center justify-center space-x-2 rtl:space-x-reverse
          px-4 py-2.5 rounded-full
          bg-gradient-to-r from-pink-500 to-purple-500 text-white
          shadow-md hover:shadow-lg transform hover:scale-105
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2
        `}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Expandable content */}
      <div 
        className={`
          absolute z-10 mt-2
          ${position === 'left' ? 'left-0' : 'right-0'}
          ${direction === 'horizontal' ? 'flex flex-row flex-wrap' : 'flex flex-col'}
          bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-pink-200
          transition-all duration-300 ease-in-out origin-top
          ${isExpanded 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
          gap-2
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default ExpandableButtonGroup;
