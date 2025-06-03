'use client'
import React, { useState, useEffect } from 'react'

interface CameraTroubleshootingProps {
  isOpen: boolean
  onClose: () => void
  issues?: string[]
  fixes?: string[]
  troubleshootingSteps?: string[]
  isEliteBook?: boolean
}

export default function CameraTroubleshooting({
  isOpen,
  onClose,
  issues = [],
  fixes = [],
  troubleshootingSteps = [],
  isEliteBook = false
}: CameraTroubleshootingProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-600">
              {isEliteBook ? '🔧 HP EliteBook Camera Issues' : '📹 Camera Troubleshooting'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {isEliteBook && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>HP EliteBook 2540p Detected:</strong> This laptop has known camera driver compatibility issues with modern web browsers. Your camera keeps turning on/off due to hardware instability.
                  </p>
                </div>
              </div>
            </div>
          )}

          {issues.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-3">🚨 Issues Detected:</h3>
              <ul className="list-disc list-inside space-y-2">
                {issues.map((issue, index) => (
                  <li key={index} className="text-gray-700">{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {fixes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Applied Fixes:</h3>
              <ul className="list-disc list-inside space-y-2">
                {fixes.map((fix, index) => (
                  <li key={index} className="text-gray-700">{fix}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">
              {isEliteBook ? '🔧 HP EliteBook Specific Solutions:' : '🛠️ Troubleshooting Steps:'}
            </h3>
            
            {isEliteBook && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Immediate Actions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li><strong>Close all camera apps</strong> (Skype, Zoom, Teams, Windows Camera)</li>
                  <li><strong>Restart Chrome/Firefox completely</strong></li>
                  <li><strong>Try incognito/private mode</strong></li>
                  <li><strong>Use audio-only mode</strong> for now (it should work)</li>
                </ol>
              </div>
            )}

            <div className="space-y-3">
              {troubleshootingSteps.length > 0 ? (
                troubleshootingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No specific troubleshooting steps available.</div>
              )}
            </div>
          </div>

          {isEliteBook && (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-green-800 mb-2">🎯 HP EliteBook Driver Fix:</h4>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>1. Update Camera Driver:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Go to Device Manager (Windows + X → Device Manager)</li>
                  <li>Find "Cameras" or "Imaging Devices"</li>
                  <li>Right-click your camera → "Update driver"</li>
                  <li>Choose "Search automatically for drivers"</li>
                </ul>
                
                <p><strong>2. Reset Camera:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>In Device Manager, right-click camera → "Disable device"</li>
                  <li>Wait 10 seconds</li>
                  <li>Right-click again → "Enable device"</li>
                  <li>Restart browser</li>
                </ul>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Alternative Solutions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><strong>Use your phone:</strong> Open Meetopia on your smartphone instead</li>
              <li><strong>External webcam:</strong> Connect a USB webcam (often works better)</li>
              <li><strong>Audio-only calls:</strong> Still very effective for connecting with people</li>
              {isEliteBook && (
                <li><strong>Different browser:</strong> Try Firefox if using Chrome, or vice versa</li>
              )}
            </ul>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Retry Camera
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Continue with Audio Only
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 