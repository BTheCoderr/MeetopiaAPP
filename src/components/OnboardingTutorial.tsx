import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TutorialStep {
  title: string;
  description: string;
  imageUrl?: string;
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

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

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Meetopia!",
      description: "Discover random video chatting with people from around the world. No signup required!",
      imageUrl: "/images/tutorial/welcome.svg"
    },
    {
      title: "Simple Controls",
      description: "Use the buttons at the bottom to control your camera and microphone. Click 'Next Person' to skip to someone new.",
      imageUrl: "/images/tutorial/controls.svg"
    },
    {
      title: "Chat Safely",
      description: "Be respectful to others. Use the report button if you encounter inappropriate behavior. Your safety is our priority.",
      imageUrl: "/images/tutorial/safety.svg"
    },
    {
      title: "Ready to Chat?",
      description: "Click 'Make a Connection' to start your first conversation. Press Space to skip to the next person.",
      imageUrl: "/images/tutorial/start.svg"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark tutorial as completed in localStorage
      localStorage.setItem('meetopia_tutorial_completed', 'true');
      onComplete();
      onClose();
    }
  };

  const handleSkip = () => {
    // Mark tutorial as completed but skipped
    localStorage.setItem('meetopia_tutorial_completed', 'true');
    localStorage.setItem('meetopia_tutorial_skipped', 'true');
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{tutorialSteps[currentStep].title}</h2>
            <button 
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip
            </button>
          </div>

          <div className="h-48 flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden p-2">
            {tutorialSteps[currentStep].imageUrl ? (
              <img
                src={tutorialSteps[currentStep].imageUrl}
                alt=""
                aria-hidden
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {tutorialSteps[currentStep].description}
          </p>

          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial; 