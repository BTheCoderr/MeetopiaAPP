# 🍎 **APP STORE CONNECT SETUP GUIDE**

## **BEFORE YOU START**

### **Requirements:**
- ✅ Apple Developer Account ($99/year)
- ✅ Privacy Policy live at: https://meetopia.vercel.app/privacy
- ✅ App screenshots (use SCREENSHOT_GUIDE.md)
- ✅ EAS build completed (TestFlight)

---

## **STEP 1: CREATE APP IN APP STORE CONNECT**

### **Go to App Store Connect:**
1. Visit: https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **"My Apps"**
4. Click **"+"** → **"New App"**

### **App Information:**
```
App Name: Meetopia
Primary Language: English (U.S.)
Bundle ID: com.bferrell514.meetopiaapp
SKU: meetopia-app-2024
```

### **User Access:**
```
Full Access: Yes (you are the developer)
```

---

## **STEP 2: APP INFORMATION TAB**

### **General Information:**
```
Name: Meetopia
Subtitle: Connect with Amazing People
Category: Social Networking
Secondary Category: (Leave blank)
```

### **Age Rating:**
Click **"Edit"** next to Age Rating:
```
Made for Kids: NO
17+ Rating Required: YES

Reasons for 17+ Rating:
☑️ Unrestricted Web Access
☑️ User Generated Content
☑️ Social Networking
```

### **App Review Information:**
```
Contact Information:
  First Name: Baheem
  Last Name: Ferrell
  Phone Number: [Your Phone Number]
  Email: bferrell514@gmail.com

Demo Account: Not Required
  (App doesn't require login)

Notes:
This is a video chat application that connects users for conversations.
- Camera test mode works without real connections
- No registration required
- All features are accessible for review
- Privacy policy explains camera/microphone usage
```

---

## **STEP 3: PRICING AND AVAILABILITY**

### **Pricing:**
```
Price Schedule: Free
```

### **Availability:**
```
Countries and Regions: All Countries/Regions
Distribution: App Store
```

---

## **STEP 4: APP STORE TAB**

### **App Information:**
```
Name: Meetopia
Subtitle: Connect with Amazing People (30 chars max)
Promotional Text: Meet new people through secure video conversations. Every chat is an adventure! (170 chars max)
```

### **Description:**
```
🚀 Ready for your Meetopia adventure?

Connect with amazing people around the world through secure video conversations. Every conversation is a new adventure waiting to unfold.

✨ FEATURES:
• Instant video chat connections
• Camera test mode for confidence
• Clean, modern interface
• Dark and light themes
• Safe and secure conversations

🎥 VIDEO CHAT:
• High-quality video calling
• Easy-to-use camera controls
• Mute/unmute functionality
• Professional video interface

🛡️ PRIVACY & SAFETY:
• No video recording or storage
• End-to-end encrypted connections
• Clear privacy policy
• Camera permissions you control

🌟 PERFECT FOR:
• Meeting new friends
• Practicing conversations
• Exploring different cultures
• Building confidence

Download Meetopia today and start your next adventure! Connect with people who share your interests and discover conversations that matter.

Age 17+ for social networking features.
```

### **Keywords:**
```
video chat,social,meeting,friends,conversation,connect,people,video call,chat,networking
```

### **Support URL:**
```
https://meetopia.vercel.app/support
```

### **Marketing URL (Optional):**
```
https://meetopia.vercel.app
```

### **Privacy Policy URL:**
```
https://meetopia.vercel.app/privacy
```

---

## **STEP 5: APP SCREENSHOTS**

### **Upload Screenshots For:**

#### **iPhone 6.7" Display (1290 × 2796):**
- Upload 4 screenshots in order:
  1. Home screen with rocket emoji
  2. Video call screen with camera
  3. Features screen
  4. Profile screen

#### **iPhone 6.5" Display (1242 × 2688):**
- Same 4 screenshots, different size

#### **iPhone 5.5" Display (1242 × 2208):**
- Same 4 screenshots, different size

### **Screenshot Captions (Optional):**
```
1. "🚀 Start your Meetopia adventure"
2. "📹 High-quality video conversations"
3. "✨ Amazing features for connecting"
4. "⚙️ Customize your experience"
```

---

## **STEP 6: BUILD UPLOAD**

### **After EAS Build Completes:**
```bash
# Your build will automatically appear in:
# App Store Connect → TestFlight → iOS Builds

# Or manually submit:
eas submit --platform ios
```

### **Build Selection:**
1. Go to **App Store Connect**
2. Your App → **App Store** tab
3. Scroll to **Build** section
4. Click **"+"** next to Build
5. Select your latest build from TestFlight

---

## **STEP 7: CONTENT RIGHTS**

### **Content Rights Declaration:**
```
☑️ Your app uses third-party content
☑️ You have all necessary rights to that content
☑️ Your app uses only content that you created or have rights to use
```

### **Advertising Identifier (IDFA):**
```
☐ Does this app use the Advertising Identifier (IDFA)?
(Select NO - your app doesn't use advertising)
```

---

## **STEP 8: SUBMISSION**

### **Final Checklist:**
- [ ] App Information completed
- [ ] Screenshots uploaded (all 3 sizes)
- [ ] Build selected
- [ ] Privacy Policy URL working
- [ ] Age rating set to 17+
- [ ] Pricing set to Free
- [ ] All required fields filled

### **Submit for Review:**
1. Click **"Save"** on all sections
2. Click **"Add for Review"**
3. Click **"Submit for Review"**

---

## **REVIEW PROCESS**

### **Timeline:**
- **In Review**: 1-3 days typically
- **Processing**: 1-2 hours after approval
- **Live on App Store**: Automatic (or manual release)

### **Common Rejection Reasons:**
1. **Privacy Policy Issues**: Ensure URL works and covers camera usage
2. **Age Rating**: Must be 17+ for social networking
3. **Functionality**: App must work as described
4. **Permissions**: Camera usage must be clearly explained

### **If Rejected:**
1. Read rejection message carefully
2. Fix the specific issues mentioned
3. Update build if needed (new EAS build)
4. Resubmit with explanation of fixes

---

## **POST-APPROVAL**

### **App Goes Live:**
- You'll receive email notification
- App appears in App Store within 2-4 hours
- Users can download immediately

### **Monitoring:**
- Check App Store Connect for downloads
- Monitor user reviews and ratings
- Respond to user feedback

---

## **QUICK REFERENCE**

### **Essential URLs:**
- **App Store Connect**: https://appstoreconnect.apple.com
- **Privacy Policy**: https://meetopia.vercel.app/privacy
- **Support**: https://meetopia.vercel.app/support

### **Key Information:**
- **Bundle ID**: com.bferrell514.meetopiaapp
- **App Name**: Meetopia
- **Category**: Social Networking
- **Age Rating**: 17+
- **Price**: Free

### **Contact Info:**
- **Developer**: Baheem Ferrell
- **Email**: bferrell514@gmail.com
- **EAS Project**: 37e69074-d079-4c60-a3c4-5d468645bcf1

---

## **TROUBLESHOOTING**

### **Common Issues:**
- **Privacy Policy 404**: Deploy latest changes to Vercel
- **Build Missing**: Wait for EAS build to complete
- **Screenshots Wrong Size**: Use exact iOS Simulator devices
- **Age Rating Error**: Must select 17+ for social features

### **Support Resources:**
- **Apple Developer Support**: developer.apple.com/support
- **App Store Review Guidelines**: developer.apple.com/app-store/review/guidelines
- **EAS Documentation**: docs.expo.dev/build/introduction

**Estimated Setup Time: 45-60 minutes** 