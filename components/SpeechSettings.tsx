import React, { useState } from 'react';
import ExpandableButtonGroup from './ExpandableButtonGroup';

interface SpeechSettingsProps {
  onSettingsChange: (settings: { rate: number; pitch: number }) => void;
}

const SpeechSettings: React.FC<SpeechSettingsProps> = ({ onSettingsChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rate, setRate] = useState(1); // سرعة الكلام الافتراضية
  const [pitch, setPitch] = useState(1); // طبقة الصوت الافتراضية

  // تغيير سرعة الكلام
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    onSettingsChange({ rate: newRate, pitch });
  };

  // تغيير طبقة الصوت
  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(newPitch);
    onSettingsChange({ rate, pitch: newPitch });
  };

  return (
    <ExpandableButtonGroup
      icon={<span className="text-xl">🔊</span>}
      label="إعدادات الصوت"
      position="left"
      direction="vertical"
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
    >
      <div className="p-3 space-y-4 w-64">
        <div>
          <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            سرعة الكلام: {rate.toFixed(1)}
          </label>
          <input
            type="range"
            id="rate"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>بطيء</span>
            <span>سريع</span>
          </div>
        </div>

        <div>
          <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            طبقة الصوت: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            id="pitch"
            min="0.5"
            max="1.5"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>منخفض</span>
            <span>مرتفع</span>
          </div>
        </div>
      </div>
    </ExpandableButtonGroup>
  );
};

export default SpeechSettings;
