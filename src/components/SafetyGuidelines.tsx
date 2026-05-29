import React, { useState, useEffect } from 'react';

interface SafetyGuidelinesProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const SafetyGuidelines: React.FC<SafetyGuidelinesProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAccept = () => {
    localStorage.setItem('meetopia_safety_accepted', 'true');
    onAccept();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Chat Safety Guidelines
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
              <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                Your safety is our priority. Please review these guidelines before chatting.
              </p>
            </div>

            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Keep personal information private (name, address, phone, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Be respectful and kind to other users</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Report inappropriate behavior using the report button</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Press ESC or click "Next Person" to leave a chat anytime</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">✗</span>
                <span>Do not engage in or encourage harmful or illegal activities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">✗</span>
                <span>Do not share or request inappropriate content</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasChecked}
                onChange={() => setHasChecked(!hasChecked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                I have read and agree to follow these guidelines
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAccept}
              disabled={!hasChecked}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Continue to Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyGuidelines; 