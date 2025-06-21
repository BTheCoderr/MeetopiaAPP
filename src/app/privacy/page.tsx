import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🔐 Meetopia Privacy Policy</h1>
          <p className="text-gray-600">Effective Date: June 21, 2025 | Last Updated: June 21, 2025</p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <p className="text-lg">
              Meetopia ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy 
              describes how we collect, use, and share information when you use our website, mobile app, 
              and services (collectively, "Meetopia").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We strive to keep Meetopia frictionless. You can use most of our services without signing up 
              or providing personal information. However, we may collect:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">a. Usage Data</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>IP address, device type, browser type, and general location (country-level only)</li>
                  <li>Timestamps, pages visited, and features used</li>
                  <li>This helps us improve performance, monitor uptime, and understand usage trends</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">b. Media Access</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>If you start a video or voice chat, we access your device's microphone and camera</li>
                  <li>Media is peer-to-peer via WebRTC and is not stored or transmitted to our servers</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">c. Optional Identifiers</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>If you voluntarily enter a display name or chat room name, we may temporarily store this information for your session</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p>We use the data we collect to:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Operate and improve our services</li>
              <li>Ensure video/chat connections are fast and secure</li>
              <li>Monitor for abuse or violations of our Terms</li>
              <li>Generate analytics for internal use (non-identifiable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Share Your Information</h2>
            <p className="mb-4">
              We do not sell or rent your personal data. We may share limited technical information with 
              trusted service providers (e.g., error tracking tools, analytics) solely to support functionality.
            </p>
            <p>We may disclose information if:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Required by law</li>
              <li>Needed to protect our users or enforce our Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies & Tracking</h2>
            <p>We may use cookies or local storage on the web version to:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Remember chat room settings</li>
              <li>Monitor performance</li>
              <li>Analyze anonymous usage patterns</li>
            </ul>
            <p className="mt-4">We do not use advertising trackers or third-party cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p>We use modern security measures to protect your data, including:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>End-to-end encrypted peer connections (WebRTC)</li>
              <li>TLS encryption for all web traffic</li>
              <li>No long-term storage of video/audio or messages</li>
            </ul>
            <p className="mt-4">However, no system is 100% secure. Please use Meetopia responsibly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Children's Privacy</h2>
            <p>
              Meetopia is not intended for users under 13 years of age. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Choices</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You can block access to your microphone/camera at any time via your browser or phone settings</li>
              <li>You may opt out of analytics tracking in your browser if supported (e.g., "Do Not Track" settings)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="mb-4">If you have questions or concerns, please contact:</p>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold">Baheem Ferrell</p>
              <p className="font-semibold">Founder, Meetopia</p>
              <p className="mt-2">📧 <a href="mailto:bferrell514@gmail.com" className="text-blue-600 hover:underline">bferrell514@gmail.com</a></p>
              <p>🌐 <a href="https://meetopia.netlify.app" className="text-blue-600 hover:underline">https://meetopia.netlify.app</a></p>
              <p>🌐 <a href="https://meetopia.vercel.app" className="text-blue-600 hover:underline">https://meetopia.vercel.app</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make changes, we will post the 
              new policy on our website and update the effective date.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            This privacy policy is effective as of June 21, 2025 and applies to all users of the Meetopia application.
          </p>
        </div>
      </div>
    </div>
  );
} 