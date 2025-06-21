# 📸 **APP STORE SCREENSHOTS GUIDE**

## **REQUIRED SCREENSHOT SIZES**

### **iPhone Screenshots (Required)**
- **iPhone 6.7"** (iPhone 15 Pro Max, 14 Pro Max): **1290 × 2796 pixels**
- **iPhone 6.5"** (iPhone 14 Plus, 13 Pro Max): **1242 × 2688 pixels**  
- **iPhone 5.5"** (iPhone 8 Plus): **1242 × 2208 pixels**

### **Screenshots Needed (4 total per size)**
1. **Home Screen** - Showing rocket emoji and "Start Connecting Now" button
2. **Video Call Screen** - Camera test mode with controls visible
3. **Features Screen** - Scrolled to show app features
4. **Profile Screen** - Dark mode toggle and settings

---

## **HOW TO TAKE SCREENSHOTS**

### **Method 1: iOS Simulator (Recommended)**
```bash
# Start the app in iOS Simulator
cd MeetopiaExpoApp
npx expo start

# Press 'i' to open iOS Simulator
# Choose different device sizes:
# - iPhone 15 Pro Max (6.7")
# - iPhone 14 Plus (6.5") 
# - iPhone 8 Plus (5.5")

# Take screenshots:
# Device menu → Screenshot (Cmd+S)
# Screenshots save to Desktop automatically
```

### **Method 2: Physical Device (Alternative)**
```bash
# Connect iPhone via USB
npx expo start --tunnel

# Scan QR code with Expo Go app
# Take screenshots with physical device
# Volume Up + Power Button = Screenshot
```

---

## **SCREENSHOT SPECIFICATIONS**

### **1. Home Screen Screenshot**
**What to Show:**
- 🚀 Rocket emoji prominently displayed
- "⭐ Start Connecting Now" button
- Clean background with floating elements (🌎✨💫)
- Bottom navigation visible

**Settings:**
- Portrait orientation
- Dark theme (matches branding)
- All UI elements clearly visible

### **2. Video Call Screen Screenshot**
**What to Show:**
- Camera preview working (your face visible)
- "Test Camera" button or camera controls
- Video call interface
- Mute/unmute buttons visible

**How to Capture:**
- Navigate to "Video Chat" tab
- Tap "Test Camera" to show camera preview
- Make sure camera permission is granted
- Take screenshot with controls visible

### **3. Features Screen Screenshot**
**What to Show:**
- List of app features
- Clean, readable text
- Scroll to show multiple features
- Consistent branding

**Navigation:**
- Home tab → Features (if accessible)
- Or navigate to features section

### **4. Profile Screen Screenshot**
**What to Show:**
- Profile settings interface
- Light/Dark mode toggle
- User preferences
- Clean, organized layout

**Settings:**
- Show dark mode (recommended)
- All form fields and toggles visible

---

## **SCREENSHOT NAMING CONVENTION**

Save screenshots with clear names:
```
iPhone_6.7_Home.png
iPhone_6.7_VideoCall.png
iPhone_6.7_Features.png
iPhone_6.7_Profile.png

iPhone_6.5_Home.png
iPhone_6.5_VideoCall.png
iPhone_6.5_Features.png
iPhone_6.5_Profile.png

iPhone_5.5_Home.png
iPhone_5.5_VideoCall.png
iPhone_5.5_Features.png
iPhone_5.5_Profile.png
```

---

## **QUALITY CHECKLIST**

### **✅ Before Taking Screenshots:**
- [ ] App is running smoothly without errors
- [ ] Camera permissions granted
- [ ] All text is readable
- [ ] UI elements are properly aligned
- [ ] No debug information visible
- [ ] Consistent theme (dark mode recommended)

### **✅ Screenshot Quality:**
- [ ] Full resolution (no compression)
- [ ] Portrait orientation only
- [ ] No status bar issues
- [ ] Clear, crisp images
- [ ] Proper aspect ratios
- [ ] No blurry or pixelated elements

---

## **APP STORE CONNECT UPLOAD**

### **Where to Upload:**
1. Go to **App Store Connect** (appstoreconnect.apple.com)
2. Select your app → **App Store** tab
3. Click **+ Version** (if needed)
4. Scroll to **App Screenshots** section
5. Upload for each device size:
   - iPhone 6.7" Display
   - iPhone 6.5" Display  
   - iPhone 5.5" Display

### **Upload Requirements:**
- PNG or JPEG format
- RGB color space
- Exact pixel dimensions required
- Maximum 500KB per image
- No alpha channels or transparency

---

## **QUICK COMMANDS**

### **Start App for Screenshots:**
```bash
cd MeetopiaExpoApp
npx expo start --clear
# Press 'i' for iOS Simulator
```

### **Test Different Devices:**
```bash
# In Expo CLI, press:
# 'i' → Choose device → Take screenshots
# Repeat for each required device size
```

### **Verify Screenshot Dimensions:**
```bash
# Check image dimensions
file ~/Desktop/screenshot.png
# Should match required sizes exactly
```

---

## **TROUBLESHOOTING**

### **Common Issues:**
- **Wrong dimensions**: Use exact iOS Simulator devices
- **Status bar visible**: Hide status bar in simulator
- **App not loading**: Clear cache with `--clear` flag
- **Camera not working**: Grant permissions in simulator

### **Solutions:**
```bash
# Clear cache and restart
npx expo start --clear

# Reset iOS Simulator
Device → Erase All Content and Settings

# Check app.json camera permissions
```

---

## **NEXT STEPS AFTER SCREENSHOTS**

1. **Organize screenshots** by device size
2. **Upload to App Store Connect**
3. **Complete app metadata**
4. **Submit for review**

**Estimated Time:** 30-45 minutes for all screenshots 