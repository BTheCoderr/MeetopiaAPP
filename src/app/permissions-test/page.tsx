'use client'
import { useState } from 'react'

export default function PermissionsTestPage() {
  const [status, setStatus] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')

  const testPermissions = async () => {
    setStatus('Testing permissions...')
    setError('')
    
    try {
      console.log('Requesting camera and microphone access...')
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser')
      }

      // Request permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      console.log('Permissions granted successfully!')
      setStream(mediaStream)
      setStatus('✅ Permissions granted! Camera and microphone access working.')
      
      // Show stream info
      const videoTracks = mediaStream.getVideoTracks()
      const audioTracks = mediaStream.getAudioTracks()
      
      console.log('Video tracks:', videoTracks)
      console.log('Audio tracks:', audioTracks)
      
      setStatus(prevStatus => 
        prevStatus + `\n📹 Video tracks: ${videoTracks.length}\n🎤 Audio tracks: ${audioTracks.length}`
      )
      
    } catch (err: any) {
      console.error('Permission test failed:', err)
      setError(`❌ Permission test failed: ${err.message}`)
      
      if (err.name === 'NotAllowedError') {
        setError(prevError => 
          prevError + '\n\n💡 Tip: Click the camera icon in your browser address bar to allow access.'
        )
      }
    }
  }

  const resetPermissions = async () => {
    try {
      // Try to get permissions query if available
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        
        setStatus(`📹 Camera: ${cameraPermission.state}\n🎤 Microphone: ${micPermission.state}`)
      }
    } catch (err) {
      console.log('Could not query permissions:', err)
    }
  }

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setStatus('')
      setError('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          🎥 Camera & Microphone Test
        </h1>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-bold text-blue-800 mb-2">📋 How to Fix Permissions:</h2>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Look for a <strong>camera icon 📹</strong> in your browser address bar</li>
            <li>Click the camera icon and select <strong>"Allow"</strong></li>
            <li>If no icon, click the <strong>lock icon 🔒</strong> → Site settings</li>
            <li>Set Camera and Microphone to <strong>"Allow"</strong></li>
            <li>Refresh this page and test again</li>
          </ol>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={testPermissions}
            disabled={!!stream}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            🚀 Test Camera & Microphone
          </button>
          
          <button
            onClick={resetPermissions}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            🔍 Check Permission Status
          </button>
          
          {stream && (
            <button
              onClick={stopStream}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              ⏹️ Stop Stream
            </button>
          )}
        </div>

        {status && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <pre className="text-sm text-green-800 whitespace-pre-wrap flex-1">{status}</pre>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-600 text-lg">❌</span>
              <pre className="text-sm text-red-800 whitespace-pre-wrap flex-1">{error}</pre>
            </div>
          </div>
        )}

        {/* Additional troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🔧 Still Having Issues?</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Try these steps:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Close and reopen your browser completely</li>
              <li>Go to Chrome Settings → Privacy and Security → Site Settings</li>
              <li>Click "Camera" then "Add" and enter: <code className="bg-yellow-100 px-1 rounded">http://localhost:3000</code></li>
              <li>Do the same for "Microphone"</li>
              <li>Make sure no other apps are using your camera</li>
            </ul>
          </div>
        </div>

        <div className="text-center border-t pt-4">
          <a
            href="/chat/video"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            ← Back to Video Chat
          </a>
        </div>
      </div>
    </div>
  )
} 