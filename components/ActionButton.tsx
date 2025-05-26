import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, disabled, icon }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center space-x-2 rtl:space-x-reverse
        w-auto text-sm px-4 py-2.5 m-1
        border border-pink-400 rounded-lg shadow-sm 
        text-pink-600 bg-white hover:bg-pink-50 
        focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-1
        transition-all duration-150 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {icon && <span className="text-pink-500">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;