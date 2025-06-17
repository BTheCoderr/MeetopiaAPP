/**
 * Enhanced Connection Manager for Smooth Peer Transitions
 * Handles the "whacky" behavior after matching by managing connection states
 */

interface PeerInfo {
  id: string;
  connectionState: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed';
  lastSeen: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'failed';
}

interface ConnectionTransition {
  fromPeer: string | null;
  toPeer: string;
  startTime: number;
  phase: 'preparing' | 'connecting' | 'stabilizing' | 'complete' | 'failed';
}

export class ConnectionManager {
  private activePeers = new Map<string, PeerInfo>();
  private currentTransition: ConnectionTransition | null = null;
  private transitionCallbacks: Array<(transition: ConnectionTransition) => void> = [];
  
  // Smooth transition between peers
  async transitionToPeer(newPeerId: string, cleanupOldConnection?: () => void): Promise<boolean> {
    console.log(`🔄 Starting transition to peer: ${newPeerId}`);
    
    const currentPeer = this.getCurrentPeer();
    
    // If we're already transitioning, wait for it to complete
    if (this.currentTransition && this.currentTransition.phase !== 'complete') {
      console.log('⏳ Waiting for current transition to complete...');
      await this.waitForTransitionComplete();
    }
    
    // Start new transition
    this.currentTransition = {
      fromPeer: currentPeer?.id || null,
      toPeer: newPeerId,
      startTime: Date.now(),
      phase: 'preparing'
    };
    
    this.notifyTransition();
    
    try {
      // Phase 1: Prepare for transition
      console.log('📋 Phase 1: Preparing transition...');
      this.currentTransition.phase = 'preparing';
      this.notifyTransition();
      
      // Clean up old connection gracefully
      if (cleanupOldConnection) {
        await this.gracefulCleanup(cleanupOldConnection);
      }
      
      // Phase 2: Establish new connection
      console.log('🔗 Phase 2: Connecting to new peer...');
      this.currentTransition.phase = 'connecting';
      this.notifyTransition();
      
      // Add new peer info
      this.activePeers.set(newPeerId, {
        id: newPeerId,
        connectionState: 'connecting',
        lastSeen: Date.now(),
        connectionQuality: 'good'
      });
      
      // Phase 3: Stabilize connection
      console.log('⚖️ Phase 3: Stabilizing connection...');
      this.currentTransition.phase = 'stabilizing';
      this.notifyTransition();
      
      // Wait for connection to stabilize
      await this.waitForStabilization(newPeerId);
      
      // Phase 4: Complete transition
      console.log('✅ Phase 4: Transition complete!');
      this.currentTransition.phase = 'complete';
      this.notifyTransition();
      
      return true;
      
    } catch (error) {
      console.error('❌ Transition failed:', error);
      if (this.currentTransition) {
        this.currentTransition.phase = 'failed';
        this.notifyTransition();
      }
      return false;
    }
  }
  
  // Graceful cleanup of old connections
  private async gracefulCleanup(cleanupFn: () => void): Promise<void> {
    return new Promise((resolve) => {
      // Give a brief moment for any ongoing operations to complete
      setTimeout(() => {
        try {
          cleanupFn();
          console.log('🧹 Old connection cleaned up gracefully');
        } catch (error) {
          console.warn('⚠️ Error during cleanup:', error);
        }
        resolve();
      }, 500); // Small delay to prevent abrupt disconnections
    });
  }
  
  // Wait for connection to stabilize
  private async waitForStabilization(peerId: string, maxWait = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const peer = this.activePeers.get(peerId);
        
        if (!peer) {
          clearInterval(checkInterval);
          reject(new Error('Peer not found'));
          return;
        }
        
        // Check if connection is stable
        if (peer.connectionState === 'connected' && peer.connectionQuality !== 'poor') {
          clearInterval(checkInterval);
          console.log(`🎯 Connection to ${peerId} stabilized`);
          resolve();
          return;
        }
        
        // Check timeout
        if (Date.now() - startTime > maxWait) {
          clearInterval(checkInterval);
          reject(new Error('Stabilization timeout'));
          return;
        }
      }, 500);
    });
  }
  
  // Wait for current transition to complete
  private async waitForTransitionComplete(maxWait = 15000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentTransition) {
        resolve();
        return;
      }
      
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (!this.currentTransition || this.currentTransition.phase === 'complete') {
          clearInterval(checkInterval);
          resolve();
          return;
        }
        
        if (Date.now() - startTime > maxWait) {
          clearInterval(checkInterval);
          reject(new Error('Transition timeout'));
          return;
        }
      }, 500);
    });
  }
  
  // Update peer connection state
  updatePeerState(peerId: string, state: PeerInfo['connectionState'], quality?: PeerInfo['connectionQuality']): void {
    const peer = this.activePeers.get(peerId);
    if (peer) {
      peer.connectionState = state;
      peer.lastSeen = Date.now();
      if (quality) {
        peer.connectionQuality = quality;
      }
      
      console.log(`📊 Peer ${peerId} state: ${state} (${peer.connectionQuality})`);
    }
  }
  
  // Get current active peer
  getCurrentPeer(): PeerInfo | null {
    const peers = Array.from(this.activePeers.values());
    for (const peer of peers) {
      if (peer.connectionState === 'connected') {
        return peer;
      }
    }
    return null;
  }
  
  // Get current transition status
  getTransitionStatus(): ConnectionTransition | null {
    return this.currentTransition;
  }
  
  // Check if currently in transition
  isTransitioning(): boolean {
    return this.currentTransition !== null && 
           this.currentTransition.phase !== 'complete' && 
           this.currentTransition.phase !== 'failed';
  }
  
  // Subscribe to transition updates
  onTransition(callback: (transition: ConnectionTransition) => void): () => void {
    this.transitionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.transitionCallbacks.indexOf(callback);
      if (index > -1) {
        this.transitionCallbacks.splice(index, 1);
      }
    };
  }
  
  // Notify transition callbacks
  private notifyTransition(): void {
    if (this.currentTransition) {
      this.transitionCallbacks.forEach(callback => {
        try {
          callback(this.currentTransition!);
        } catch (error) {
          console.error('Error in transition callback:', error);
        }
      });
    }
  }
  
  // Remove old/inactive peers
  cleanup(): void {
    const now = Date.now();
    const timeout = 30000; // 30 seconds
    
    const entries = Array.from(this.activePeers.entries());
    for (const [peerId, peer] of entries) {
      if (now - peer.lastSeen > timeout && peer.connectionState !== 'connected') {
        console.log(`🗑️ Removing inactive peer: ${peerId}`);
        this.activePeers.delete(peerId);
      }
    }
  }
  
  // Reset all connections (useful for debugging)
  reset(): void {
    console.log('🔄 Resetting connection manager');
    this.activePeers.clear();
    this.currentTransition = null;
  }
}

// Global connection manager instance
export const connectionManager = new ConnectionManager();

// Auto-cleanup inactive peers every 30 seconds
setInterval(() => {
  connectionManager.cleanup();
}, 30000); 