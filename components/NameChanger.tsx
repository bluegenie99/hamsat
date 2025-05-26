import React, { useState, useRef } from 'react';
import ExpandableButtonGroup from './ExpandableButtonGroup';

interface NameChangerProps {
  currentName: string;
  onNameChange: (newName: string) => void;
}

const NameChanger: React.FC<NameChangerProps> = ({ currentName, onNameChange }) => {
  const [inputName, setInputName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      onNameChange(inputName.trim());
      setInputName('');
      setIsExpanded(false); // Close the dropdown after changing the name
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(e.target.value);
  };

  return (
    <ExpandableButtonGroup
      icon={<span className="text-xl">💝</span>}
      label="غيّر اسم دلوعتك"
      position="left"
      direction="horizontal"
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1">
        <input
          ref={inputRef}
          type="text"
          value={inputName}
          onChange={handleInputChange}
          placeholder={`الاسم الحالي: ${currentName}`}
          className="flex-grow p-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-shadow placeholder-pink-400 text-pink-700 font-medium"
          maxLength={15}
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-md transform hover:scale-105 transition-all duration-200"
        >
          تغيير
        </button>
      </form>
    </ExpandableButtonGroup>
  );
};

export default NameChanger;
