'use client'
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionTroubleshootingProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme?: boolean;
}

const TROUBLESHOOTING_SECTIONS = [
  {
    title: 'Camera & microphone not working',
    items: [
      'Click the lock icon in your browser address bar and allow camera and microphone access.',
      'Close other apps that may be using your camera (Zoom, FaceTime, etc.).',
      'Refresh the page after granting permissions.',
    ],
  },
  {
    title: 'Cannot connect to another user',
    items: [
      'Make sure both users clicked "Make a Connection" and the signaling server is running.',
      'Try clicking "Next person" to find a new match.',
      'Disable VPN or proxy temporarily — they can block WebRTC connections.',
    ],
  },
  {
    title: 'Video freezes or disconnects',
    items: [
      'Check your internet connection — video chat needs at least 1 Mbps upload/download.',
      'Move closer to your Wi-Fi router or switch to a wired connection.',
      'Close bandwidth-heavy tabs or downloads.',
    ],
  },
  {
    title: 'Firewall or strict network (work/school)',
    items: [
      'Some corporate or school networks block peer-to-peer connections.',
      'A TURN relay server is required in these environments — contact your admin or try a mobile hotspot.',
      'UDP ports 3478 and 49152–65535 may need to be open for WebRTC.',
    ],
  },
  {
    title: 'Still having issues?',
    items: [
      'Try a different browser (Chrome or Firefox recommended).',
      'Clear browser cache and reload the page.',
      'Visit /test-video to verify your camera works independently.',
    ],
  },
];

const ConnectionTroubleshooting: React.FC<ConnectionTroubleshootingProps> = ({
  isOpen,
  onClose,
  isDarkTheme = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDarkTheme ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${
              isDarkTheme ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <h2 className="text-lg font-semibold">Connection Troubleshooting</h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              {TROUBLESHOOTING_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className={`font-medium mb-2 ${
                    isDarkTheme ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {section.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className={`text-sm flex gap-2 ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        <span className="text-blue-500 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={`sticky bottom-0 p-4 border-t ${
              isDarkTheme ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionTroubleshooting;
