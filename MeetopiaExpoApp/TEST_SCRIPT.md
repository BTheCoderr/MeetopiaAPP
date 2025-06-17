# 🧪 Quick Testing Script for Meetopia

## **5-Minute Functionality Test**

### **Step 1: Launch & Navigation (1 min)**
1. Open app → Should see Home screen with logo
2. Tap "Video Chat" tab → Should navigate to video screen
3. Tap "Features" tab → Should show features page
4. Tap "Profile" tab → Should show profile form
5. Return to "Video Chat" tab

**✅ Pass Criteria:** All tabs navigate smoothly, no crashes

### **Step 2: Video Call Screen (2 min)**
1. Should see "Ready to Call" status
2. Should see "Start Video Call" and "Test Camera" buttons (normal size)
3. Tap "Test Camera" → Should request camera permission
4. Grant permission → Should see your camera feed full screen
5. Tap camera controls → Should turn on/off camera
6. Tap flip camera → Should switch front/back
7. Tap "Exit Test" → Should return to normal mode

**✅ Pass Criteria:** Camera works, controls respond, no crashes

### **Step 3: Call Simulation (1 min)**
1. Tap "Start Video Call" → Should show "Connecting..."
2. After 3 seconds → Should show "Connected" with timer
3. Should see PiP window with your camera
4. Test mute/camera/flip controls → Should work
5. Tap red end call button → Should return to ready state

**✅ Pass Criteria:** Call flow works, timer counts, controls function

### **Step 4: UI Features (1 min)**
1. Tap "Tutorial" → Should show helpful popup
2. Tap "☀️" → Should toggle to light mode
3. Tap "🌙" → Should toggle back to dark mode
4. Tap share button → Should open share sheet
5. Test on different screens → All should have consistent theming

**✅ Pass Criteria:** All UI elements work, themes apply correctly

## **Device-Specific Tests**

### **iPhone SE (Small Screen)**
- [ ] All buttons are touchable (not too small)
- [ ] Text doesn't get cut off
- [ ] Video fills screen properly
- [ ] Controls don't overlap

### **iPhone 15 Pro Max (Large Screen)**
- [ ] Layout scales properly
- [ ] No excessive white space
- [ ] PiP window positioned correctly
- [ ] Header elements aligned

## **Edge Case Tests**

### **Permission Handling**
1. Deny camera permission → Should show helpful message
2. Go to Settings → Enable camera → Return to app
3. Should work normally after permission granted

### **App Backgrounding**
1. Start test camera mode
2. Background app (home button/swipe)
3. Return to app → Should resume properly
4. No crashes or black screens

## **Performance Checks**

### **Memory & CPU**
- [ ] App launches within 3 seconds
- [ ] Camera feed is smooth (30fps)
- [ ] No memory warnings in console
- [ ] Device doesn't get hot during use

### **Battery Usage**
- [ ] Camera usage is reasonable
- [ ] App doesn't drain battery excessively
- [ ] Background usage is minimal

## **Quick Fix Checklist**

If you find issues:

### **Camera Not Working**
```bash
# Restart Expo with cleared cache
npx expo start --clear
```

### **Layout Issues**
- Check safe area handling
- Verify responsive design
- Test on multiple screen sizes

### **Performance Issues**
- Close other apps
- Restart device
- Check for memory leaks

## **Ready for App Store?**

**✅ YES** if all tests pass:
- Navigation works smoothly
- Camera functionality complete
- No crashes during normal use
- UI looks professional
- Performance is acceptable

**❌ NO** if any critical issues:
- Camera doesn't work
- App crashes frequently
- UI is broken or unprofessional
- Major performance problems

---

**Current Status: READY FOR TESTING** 🚀

Button sizes have been fixed to appropriate touch targets. Run through this test script to verify everything works before App Store submission! 