'use client';

import { useEffect, useState } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

const stats: Stat[] = [
  { value: '2.8K+', label: 'Active Users', icon: '👥' },
  { value: '15.6K+', label: 'Connections Made', icon: '💫' },
  { value: '89', label: 'Countries', icon: '🌍' },
  { value: '4.8★', label: 'App Rating', icon: '⭐' }
];

const features: Feature[] = [
  {
    icon: '📹',
    title: 'HD Video Chat',
    description: 'Crystal clear video calls with advanced noise cancellation and auto-focus technology.'
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    description: 'AI-powered algorithm connects you with compatible people based on interests and preferences.'
  },
  {
    icon: '🎭',
    title: 'Virtual Backgrounds',
    description: 'Express yourself with custom backgrounds and AR filters for engaging conversations.'
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'End-to-end encryption ensures your conversations remain private and secure.'
  },
  {
    icon: '⚡',
    title: 'Instant Connection',
    description: 'Connect with people worldwide in seconds with our optimized matching system.'
  },
  {
    icon: '📱',
    title: 'Cross-Platform',
    description: 'Seamlessly switch between mobile, tablet, and web versions of Meetopia.'
  }
];

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    location: 'San Francisco, USA',
    text: 'Meetopia has completely changed how I connect with people. The video quality is amazing and I\'ve made friends from around the world!',
    rating: 5
  },
  {
    name: 'Ahmed Hassan',
    location: 'Dubai, UAE',
    text: 'The smart matching feature is incredible. It really understands what I\'m looking for in conversations and connections.',
    rating: 5
  },
  {
    name: 'Maria Rodriguez',
    location: 'Barcelona, Spain',
    text: 'Safe, fun, and easy to use. I love the virtual backgrounds feature - it makes every call more engaging!',
    rating: 5
  }
];

export default function MarketingPage() {
  const [animatedStats, setAnimatedStats] = useState<boolean[]>([]);

  useEffect(() => {
    // Animate stats on mount
    const timer = setTimeout(() => {
      setAnimatedStats(new Array(stats.length).fill(true));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-block animate-bounce">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">M</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                Meet<span className="text-yellow-300">opia</span>
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Connect Worldwide 🌍
              </p>
            </div>
            
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of global connections with HD video chat, 
              smart matching, and meaningful conversations that bridge cultures and continents.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                Download Now 📱
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
                Watch Demo 🎥
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transform transition-all duration-1000 ${
                  animatedStats[index] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Meetopia?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the features that make Meetopia the world's most trusted platform for global connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join millions of satisfied users worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Connect? 🚀
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the global community and start making meaningful connections today
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
              Get Started Free 🎯
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
              Learn More 📚
            </button>
          </div>
          
          <p className="text-sm opacity-75">
            Available on iOS, Android, and Web • Free to start • No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <div className="font-bold text-lg">Meetopia</div>
                <div className="text-sm text-gray-400">Connect Worldwide</div>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="/support" className="hover:text-blue-400 transition-colors">Support</a>
              <a href="/about" className="hover:text-blue-400 transition-colors">About</a>
              <a href="/" className="hover:text-blue-400 transition-colors">Privacy</a>
              <a href="/" className="hover:text-blue-400 transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 Meetopia. All rights reserved. Made with ❤️ for global connections.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 