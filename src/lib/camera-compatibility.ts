// Camera Compatibility System for Older Laptops
// Specifically designed for HP EliteBook 2540p and similar problematic hardware

interface CameraInfo {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

interface CameraCompatibilityResult {
  isSupported: boolean
  recommendedConstraints: MediaStreamConstraints
  issues: string[]
  fixes: string[]
}

export class CameraCompatibilityManager {
  private problemDevices = [
    'FaceTime HD Camera',
    'HP TrueVision HD',
    'HP Webcam',
    'Integrated Camera',
    'USB Camera',
    'Generic USB Video Class'
  ]

  private olderLaptopModels = [
    'elitebook', 'pavilion', 'compaq', 'presario',
    'thinkpad', 'latitude', 'inspiron', 'vostro',
    'aspire', 'travelmate', 'extensa'
  ]

  async detectCameraIssues(): Promise<CameraCompatibilityResult> {
    const result: CameraCompatibilityResult = {
      isSupported: true,
      recommendedConstraints: {},
      issues: [],
      fixes: []
    }

    try {
      // Get system info
      const userAgent = navigator.userAgent.toLowerCase()
      const isOlderLaptop = this.olderLaptopModels.some(model => userAgent.includes(model))
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      
      console.log('🔍 Camera Detection:', {
        cameras: cameras.map(c => ({ id: c.deviceId, label: c.label })),
        userAgent: userAgent.substring(0, 100) + '...',
        isOlderLaptop
      })

      if (cameras.length === 0) {
        result.isSupported = false
        result.issues.push('No cameras detected')
        result.fixes.push('Check camera drivers and permissions')
        return result
      }

      // Check for problematic cameras
      const problematicCamera = cameras.find(camera => 
        this.problemDevices.some(problem => camera.label.includes(problem))
      )

      if (problematicCamera || isOlderLaptop) {
        result.issues.push('Older/problematic camera hardware detected')
        result.fixes.push('Using compatibility mode with reduced constraints')
        
        // Ultra-conservative constraints for problematic hardware
        result.recommendedConstraints = {
          video: {
            width: { exact: 320 },
            height: { exact: 240 },
            frameRate: { exact: 15 },
            facingMode: 'user',
            // Force specific device if detected
            ...(problematicCamera && { deviceId: { exact: problematicCamera.deviceId } })
          },
          audio: {
            echoCancellation: false, // Disable processing that might conflict
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 22050 // Lower sample rate
          }
        }
      } else {
        // Standard constraints for modern hardware
        result.recommendedConstraints = {
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 20, max: 30 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        }
      }

      // Test camera stability
      const stabilityResult = await this.testCameraStability()
      if (!stabilityResult.isStable) {
        result.issues.push(...stabilityResult.issues)
        result.fixes.push(...stabilityResult.fixes)
        
        // Further reduce constraints for unstable cameras
        if (result.recommendedConstraints.video && typeof result.recommendedConstraints.video === 'object') {
          result.recommendedConstraints.video = {
            width: { exact: 160 },
            height: { exact: 120 },
            frameRate: { exact: 10 }
          }
        }
      }

      return result

    } catch (error) {
      console.error('Camera compatibility check failed:', error)
      result.isSupported = false
      result.issues.push(`Camera access failed: ${error}`)
      result.fixes.push('Try restarting browser or computer')
      return result
    }
  }

  private async testCameraStability(): Promise<{ isStable: boolean, issues: string[], fixes: string[] }> {
    const result = { isStable: true, issues: [] as string[], fixes: [] as string[] }

    try {
      console.log('🧪 Testing camera stability...')
      
      // Quick test with minimal constraints
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, frameRate: 5 },
        audio: false // Audio-only test first
      })

      // Test if stream immediately ends
      const tracks = testStream.getVideoTracks()
      if (tracks.length === 0) {
        result.isStable = false
        result.issues.push('Camera produces no video tracks')
        result.fixes.push('Camera driver may be corrupted')
        return result
      }

      const track = tracks[0]
      let trackEnded = false
      
      track.addEventListener('ended', () => {
        trackEnded = true
        result.isStable = false
        result.issues.push('Camera track ends immediately')
        result.fixes.push('Camera hardware instability detected')
      })

      // Wait 2 seconds to see if track stays alive
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check track settings
      const settings = track.getSettings()
      console.log('📹 Camera test settings:', settings)

      if (!settings.width || !settings.height) {
        result.isStable = false
        result.issues.push('Camera provides invalid dimensions')
        result.fixes.push('Try different resolution constraints')
      }

      if (trackEnded) {
        result.isStable = false
        result.issues.push('Camera disconnects immediately')
        result.fixes.push('Hardware compatibility issue detected')
      }

      // Clean up test stream
      testStream.getTracks().forEach(track => track.stop())

      console.log('🧪 Camera stability test result:', result)
      return result

    } catch (error) {
      console.error('Camera stability test failed:', error)
      result.isStable = false
      result.issues.push(`Stability test failed: ${error}`)
      result.fixes.push('Camera may not support WebRTC properly')
      return result
    }
  }

  // Get emergency fallback constraints for completely broken cameras
  getEmergencyConstraints(): MediaStreamConstraints {
    return {
      video: {
        width: { exact: 160 },
        height: { exact: 120 },
        frameRate: { exact: 5 },
        // Try to force most basic format
        advanced: [
          { width: 160, height: 120 },
          { frameRate: 5 }
        ]
      },
      audio: {
        sampleRate: 8000, // Phone quality audio
        channelCount: 1,   // Mono
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    }
  }

  // Audio-only fallback for completely broken cameras
  getAudioOnlyConstraints(): MediaStreamConstraints {
    return {
      video: false,
      audio: {
        sampleRate: 22050,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }
  }

  // Get camera troubleshooting steps
  getTroubleshootingSteps(): string[] {
    return [
      '1. Close all other applications using camera (Skype, Zoom, Teams)',
      '2. Restart your browser completely',
      '3. Try Chrome or Firefox (avoid Safari/Edge for older laptops)',
      '4. Update camera drivers from manufacturer website',
      '5. Disable camera in Device Manager, then re-enable',
      '6. Try different USB ports (if external camera)',
      '7. Check Windows Camera app - does it work there?',
      '8. Run Windows Camera troubleshooter',
      '9. Consider using phone/tablet as backup device'
    ]
  }

  // Check if this is likely an HP EliteBook or similar problematic model
  isProblematicHardware(): boolean {
    const userAgent = navigator.userAgent.toLowerCase()
    return this.olderLaptopModels.some(model => userAgent.includes(model)) ||
           userAgent.includes('windows nt 6.1') || // Windows 7
           userAgent.includes('windows nt 6.0')    // Windows Vista
  }
} 