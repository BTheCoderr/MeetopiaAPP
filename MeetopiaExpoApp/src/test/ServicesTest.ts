// Simple test file to verify our services work correctly
import VideoCallService from '../services/VideoCallService';
import ChatService from '../services/ChatService';
import MatchingService from '../services/MatchingService';

export const testServices = async () => {
  console.log('🧪 Testing Meetopia Services...');

  // Test VideoCallService
  console.log('📹 Testing VideoCallService...');
  try {
    console.log('✅ VideoCallService loaded successfully');
    console.log('- Audio state:', VideoCallService.getAudioState());
    console.log('- Video state:', VideoCallService.getVideoState());
    console.log('- Connection state:', VideoCallService.isConnected());
  } catch (error) {
    console.error('❌ VideoCallService error:', error);
  }

  // Test ChatService
  console.log('💬 Testing ChatService...');
  try {
    console.log('✅ ChatService loaded successfully');
    console.log('- Connection state:', ChatService.isConnectedToServer());
    console.log('- Quick messages:', ChatService.getQuickMessages().slice(0, 3));
    console.log('- Emoji reactions:', ChatService.getEmojiReactions().slice(0, 5));
  } catch (error) {
    console.error('❌ ChatService error:', error);
  }

  // Test MatchingService
  console.log('💕 Testing MatchingService...');
  try {
    console.log('✅ MatchingService loaded successfully');
    console.log('- Connection state:', MatchingService.isConnectedToServer());
    
    // Test mock profile generation
    const mockProfiles = MatchingService.generateMockProfiles(3);
    console.log('- Generated mock profiles:', mockProfiles.length);
    console.log('- Sample profile:', {
      name: mockProfiles[0]?.name,
      age: mockProfiles[0]?.age,
      interests: mockProfiles[0]?.interests.slice(0, 3),
    });

    // Test compatibility calculation
    if (mockProfiles.length >= 2) {
      const compatibility = MatchingService.calculateCompatibilityScore(
        mockProfiles[0],
        mockProfiles[1]
      );
      console.log('- Compatibility score:', compatibility + '%');
    }
  } catch (error) {
    console.error('❌ MatchingService error:', error);
  }

  console.log('🎉 Service testing completed!');
};

// Test individual service methods
export const testVideoCallFeatures = () => {
  console.log('🎥 Testing Video Call Features...');
  
  // Test media controls
  const audioEnabled = VideoCallService.toggleAudio();
  console.log('- Audio toggled:', audioEnabled ? 'ON' : 'OFF');
  
  const videoEnabled = VideoCallService.toggleVideo();
  console.log('- Video toggled:', videoEnabled ? 'ON' : 'OFF');
  
  console.log('- Room ID:', VideoCallService.getRoomId() || 'Not set');
  console.log('- User ID:', VideoCallService.getUserId() || 'Not set');
};

export const testChatFeatures = async () => {
  console.log('💭 Testing Chat Features...');
  
  try {
    // Test message storage (mock)
    const mockRoomId = 'test_room_123';
    const messages = await ChatService.getMessagesFromStorage(mockRoomId);
    console.log('- Messages in storage:', messages.length);
    
    // Test chat rooms
    const chatRooms = await ChatService.getChatRooms();
    console.log('- Chat rooms:', chatRooms.length);
    
  } catch (error) {
    console.error('❌ Chat features error:', error);
  }
};

export const testMatchingFeatures = async () => {
  console.log('💘 Testing Matching Features...');
  
  try {
    // Test matching stats
    const stats = await MatchingService.getMatchingStats();
    console.log('- Matching stats:', stats);
    
    // Test matches storage
    const matches = await MatchingService.getMatches();
    console.log('- Stored matches:', matches.length);
    
    // Test swipe actions
    const swipeActions = await MatchingService.getSwipeActions();
    console.log('- Swipe actions:', swipeActions.length);
    
  } catch (error) {
    console.error('❌ Matching features error:', error);
  }
};

// Export all tests
export default {
  testServices,
  testVideoCallFeatures,
  testChatFeatures,
  testMatchingFeatures,
}; 