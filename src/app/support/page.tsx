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

export default function SupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meetopia Support</h1>
              <p className="text-sm text-gray-600">We're here to help you connect</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">General Support</h3>
              <p className="text-sm text-gray-600 mb-3">Questions about using Meetopia</p>
              <a href="mailto:bferrell514@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">
                bferrell514@gmail.com
              </a>
            </div>
            
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🐛</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bug Reports</h3>
              <p className="text-sm text-gray-600 mb-3">Found a technical issue?</p>
              <a href="mailto:bferrell514@gmail.com" className="text-red-600 hover:text-red-700 font-medium">
                bferrell514@gmail.com
              </a>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">💡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-sm text-gray-600 mb-3">Share your ideas with us</p>
              <a href="mailto:bferrell514@gmail.com" className="text-green-600 hover:text-green-700 font-medium">
                bferrell514@gmail.com
              </a>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="font-medium text-gray-900">Response Time: Within 24 hours</p>
                <p className="text-sm text-gray-600">Support Hours: Monday-Friday, 9 AM - 6 PM PST</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className={`transform transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-4">Still Need Help?</h3>
          <p className="mb-6 opacity-90">
            Our support team is dedicated to ensuring you have the best experience with Meetopia.
            Don't hesitate to reach out with any questions or concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:bferrell514@gmail.com"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Back to App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 