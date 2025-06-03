'use client'
import React, { useState, useEffect } from 'react'
import { NetworkDiagnostics } from '../../lib/network-diagnostics'

interface DiagnosticResult {
  category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  score: number
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    solution: string
  }>
  recommendations: string[]
  metrics: {
    bandwidth: { download: number; upload: number; stability: number }
    latency: { avg: number; min: number; max: number; jitter: number }
    connectivity: { nat: string; firewall: boolean; ipv6: boolean }
    device: { camera: boolean; microphone: boolean; speakers: boolean }
  }
}

interface NetworkDiagnosticsProps {
  onClose: () => void
  isOpen: boolean
}

export default function NetworkDiagnosticsComponent({ onClose, isOpen }: NetworkDiagnosticsProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')

  const diagnostics = new NetworkDiagnostics()

  useEffect(() => {
    if (isOpen && !results) {
      runQuickCheck()
    }
  }, [isOpen])

  const runQuickCheck = async () => {
    try {
      setCurrentTest('Quick system check...')
      setProgress(20)
      
      const quickCheck = await diagnostics.quickCheck()
      setProgress(100)
      
      if (!quickCheck.ready) {
        setResults({
          category: 'critical',
          score: 0,
          issues: quickCheck.issues.map(issue => ({
            severity: 'critical' as const,
            message: issue,
            solution: 'Please resolve this issue before continuing'
          })),
          recommendations: ['Fix critical issues before attempting video calls'],
          metrics: {
            bandwidth: { download: 0, upload: 0, stability: 0 },
            latency: { avg: 0, min: 0, max: 0, jitter: 0 },
            connectivity: { nat: 'unknown', firewall: false, ipv6: false },
            device: { camera: false, microphone: false, speakers: false }
          }
        })
      }
    } catch (error) {
      console.error('Quick check failed:', error)
    }
  }

  const runFullDiagnostic = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults(null)

    try {
      // Simulate progress updates
      const progressSteps = [
        'Testing bandwidth...',
        'Measuring latency...',
        'Checking connectivity...',
        'Testing devices...',
        'Analyzing results...'
      ]

      for (let i = 0; i < progressSteps.length; i++) {
        setCurrentTest(progressSteps[i])
        setProgress((i + 1) * 20)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const result = await diagnostics.runFullDiagnostic()
      setResults(result)
      setProgress(100)
      setCurrentTest('Diagnostic complete!')
    } catch (error) {
      console.error('Diagnostic failed:', error)
      setCurrentTest('Diagnostic failed')
    } finally {
      setIsRunning(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatBandwidth = (mbps: number) => {
    if (mbps === 0) return 'Unknown'
    if (mbps < 1) return `${Math.round(mbps * 1000)} Kbps`
    return `${mbps.toFixed(1)} Mbps`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              🔧 Network Diagnostics
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Check your connection quality and troubleshoot issues
          </p>
        </div>

        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={runFullDiagnostic}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRunning ? 'Running Tests...' : 'Run Full Diagnostic'}
            </button>
            
            <button
              onClick={runQuickCheck}
              disabled={isRunning}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
            >
              Quick Check
            </button>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentTest}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Overall Assessment</h3>
                  <div className={`px-4 py-2 rounded-full font-semibold ${getCategoryColor(results.category)}`}>
                    {results.category.toUpperCase()} ({results.score}/100)
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatBandwidth(results.metrics.bandwidth.download)}
                    </div>
                    <div className="text-sm text-gray-600">Download Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results.metrics.latency.avg}ms
                    </div>
                    <div className="text-sm text-gray-600">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.metrics.connectivity.nat.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">NAT Type</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(results.metrics.bandwidth.stability * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Stability</div>
                  </div>
                </div>
              </div>

              {/* Issues */}
              {results.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">
                    🚨 Issues Found ({results.issues.length})
                  </h3>
                  <div className="space-y-3">
                    {results.issues.map((issue, index) => (
                      <div key={index} className="bg-white rounded p-4 border-l-4 border-red-400">
                        <div className={`font-semibold ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}: {issue.message}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          💡 {issue.solution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bandwidth & Latency */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    📊 Network Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Download Speed:</span>
                      <span className="font-semibold">
                        {formatBandwidth(results.metrics.bandwidth.download)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Speed:</span>
                      <span className="font-semibold">
                        {formatBandwidth(results.metrics.bandwidth.upload)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span className="font-semibold">{results.metrics.latency.avg}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jitter:</span>
                      <span className="font-semibold">{results.metrics.latency.jitter}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stability:</span>
                      <span className="font-semibold">
                        {(results.metrics.bandwidth.stability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Device & Connectivity */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    🔌 Device & Connectivity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Camera:</span>
                      <span className={`font-semibold ${
                        results.metrics.device.camera ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results.metrics.device.camera ? '✅ Working' : '❌ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Microphone:</span>
                      <span className={`font-semibold ${
                        results.metrics.device.microphone ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {results.metrics.device.microphone ? '✅ Working' : '❌ Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>NAT Type:</span>
                      <span className="font-semibold">{results.metrics.connectivity.nat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Firewall:</span>
                      <span className={`font-semibold ${
                        results.metrics.connectivity.firewall ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {results.metrics.connectivity.firewall ? 'Detected' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>IPv6:</span>
                      <span className={`font-semibold ${
                        results.metrics.connectivity.ipv6 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {results.metrics.connectivity.ipv6 ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                  💡 Recommendations
                </h3>
                <ul className="space-y-2">
                  {results.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 