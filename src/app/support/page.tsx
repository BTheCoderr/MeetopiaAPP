'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I start using Meetopia?",
    answer: "Simply download the app, create your profile, and start connecting with people worldwide through our smart matching system."
  },
  {
    question: "Is Meetopia free to use?",
    answer: "Yes! Meetopia offers free video calls and basic features. Premium features are available through our subscription plans."
  },
  {
    question: "How does the matching system work?",
    answer: "Our AI-powered matching system connects you with compatible people based on your interests, location preferences, and availability."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use end-to-end encryption for all communications and never share your personal data with third parties."
  },
  {
    question: "Can I use Meetopia on multiple devices?",
    answer: "Yes, your account syncs across all devices. You can use Meetopia on mobile, tablet, and web seamlessly."
  },
  {
    question: "How do I report inappropriate behavior?",
    answer: "Use the report button during any call or conversation. Our moderation team reviews all reports within 24 hours."
  },
  {
    question: "What should I do if I'm experiencing technical issues?",
    answer: "Try restarting the app first. If issues persist, contact our support team with details about your device and the problem."
  },
  {
    question: "How do I delete my account?",
    answer: "Go to Settings > Account > Delete Account. Note that this action is permanent and cannot be undone."
  }
];

export default function Support() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Support & Help
          </h1>
          <p className="text-gray-400 text-lg">
            We're here to help you with Meetopia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">📞 Contact Us</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Email Support</h3>
                <p className="text-gray-300">bferrell514@gmail.com</p>
                <p className="text-gray-400 text-sm">We typically respond within 24 hours</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-300">App Information</h3>
                <p className="text-gray-300">Meetopia Mobile App</p>
                <p className="text-gray-400 text-sm">Social Networking • Video Chat</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-400 mb-6">🎥 Common Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-300">Camera Not Working?</h3>
                <p className="text-gray-300 text-sm">Check camera permissions in iOS Settings → Meetopia → Camera</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-300">App Crashing?</h3>
                <p className="text-gray-300 text-sm">Try restarting the app or updating to the latest version</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">🛡️ Privacy & Safety</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-300">Privacy Policy</h3>
              <p className="text-gray-300 mb-4">
                Read our comprehensive privacy policy to understand how we protect your information.
              </p>
              <a 
                href="/privacy" 
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Privacy Policy
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-300">Safety Features</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• No video recording or storage</li>
                <li>• End-to-end encrypted connections</li>
                <li>• Camera permissions you control</li>
                <li>• Age-appropriate content (17+)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">🔧 Troubleshooting</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-300">Camera Issues</h3>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>Go to iOS Settings → Privacy & Security → Camera</li>
                  <li>Find "Meetopia" and make sure it's enabled</li>
                  <li>Restart the app and try again</li>
                  <li>If still not working, restart your device</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-300">Audio Problems</h3>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>Check microphone permissions in iOS Settings</li>
                  <li>Make sure your device isn't muted</li>
                  <li>Test with other apps to verify microphone works</li>
                  <li>Close other apps that might use the microphone</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-300">App Performance</h3>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                  <li>Close other apps to free up memory</li>
                  <li>Make sure you have a stable internet connection</li>
                  <li>Update to the latest version of Meetopia</li>
                  <li>Restart your device if problems persist</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">📱 System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cyan-300">iOS Requirements</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• iOS 15.1 or later</li>
                <li>• iPhone 6s or newer</li>
                <li>• Camera and microphone access</li>
                <li>• Internet connection (Wi-Fi or cellular)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-cyan-300">Recommended</h3>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• Strong Wi-Fi connection for best quality</li>
                <li>• Good lighting for video calls</li>
                <li>• Quiet environment for clear audio</li>
                <li>• Latest iOS version</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Still Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="space-y-4">
            <p className="text-gray-300">
              <strong>Email:</strong> bferrell514@gmail.com
            </p>
            <p className="text-gray-400 text-sm">
              Include your device model, iOS version, and a description of the issue for fastest support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 