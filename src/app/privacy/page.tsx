export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Your privacy is important to us
          </p>
        </div>

        <div className="prose prose-lg prose-invert max-w-none">
          <div className="bg-gray-800/50 rounded-lg p-8 mb-8">
            <p className="text-gray-300 mb-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-gray-300">
              This Privacy Policy describes how Meetopia ("we," "our," or "us") collects, uses, and protects your information when you use our mobile application.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">🎥 Camera and Microphone Usage</h2>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Why We Need Camera Access</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>To enable video calls between users</li>
                <li>To allow you to test your camera before joining calls</li>
                <li>To provide video chat functionality</li>
                <li>No video is recorded or stored on our servers</li>
              </ul>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Why We Need Microphone Access</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>To enable audio communication during video calls</li>
                <li>To allow you to test your microphone settings</li>
                <li>No audio is recorded or stored on our servers</li>
                <li>All audio is transmitted in real-time only</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-green-400 mb-6">📱 Information We Collect</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-green-300">Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Profile information (optional)</li>
                  <li>Display name and preferences</li>
                  <li>Settings and preferences</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-green-300">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Device type and operating system</li>
                  <li>App usage analytics</li>
                  <li>Error logs and crash reports</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-red-400 mb-6">🛡️ Information We DON'T Collect</h2>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><strong>No video recording:</strong> We do not record or store any video content</li>
                <li><strong>No audio recording:</strong> We do not record or store any audio content</li>
                <li><strong>No location tracking:</strong> We do not access or store your location</li>
                <li><strong>No contacts access:</strong> We do not access your contacts or address book</li>
                <li><strong>No social media linking:</strong> We do not connect to or access social media accounts</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">🔒 How We Protect Your Information</h2>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-yellow-300">Security Measures</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>End-to-end encryption for all video calls</li>
                  <li>Secure data transmission protocols</li>
                  <li>No permanent storage of personal conversations</li>
                  <li>Regular security updates and monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-indigo-400 mb-6">👤 Your Rights and Choices</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-300">Camera & Microphone</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>You can deny camera/microphone permissions</li>
                  <li>You can revoke permissions anytime in iOS Settings</li>
                  <li>App will still work with limited functionality</li>
                </ul>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-indigo-300">Data Control</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Delete app to remove all local data</li>
                  <li>No account deletion needed (no accounts)</li>
                  <li>Contact us for data inquiries</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-pink-400 mb-6">👶 Children's Privacy</h2>
            <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                <strong>Age Restriction:</strong> Meetopia is intended for users aged 17 and above. We do not knowingly collect personal information from children under 17.
              </p>
              <p className="text-gray-300">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">🌍 International Users</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                Meetopia is available worldwide. Your information may be transferred to and processed in the United States and other countries where our servers are located.
              </p>
              <p className="text-gray-300">
                By using our app, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-orange-400 mb-6">📝 Changes to This Policy</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. When we do, we will post the updated policy in the app and update the "Last updated" date at the top of this page.
              </p>
              <p className="text-gray-300">
                We recommend reviewing this policy periodically to stay informed about how we protect your information.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">📞 Contact Us</h2>
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><strong>Email:</strong> bferrell514@gmail.com</p>
                <p><strong>App:</strong> Meetopia Mobile App</p>
                <p><strong>Website:</strong> meetopia.vercel.app</p>
              </div>
            </div>
          </section>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">🛡️ Your Privacy Matters</h3>
            <p className="text-gray-300">
              We are committed to protecting your privacy and providing a safe, secure experience. 
              This policy reflects our dedication to transparency and your right to privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 