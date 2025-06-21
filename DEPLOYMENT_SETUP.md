# 🚀 Meetopia Production Deployment Guide

## 📱 **Current Status - All Platforms Working!**

✅ **Web App**: `http://localhost:4000` (Dev) → `https://meetopia.vercel.app` (Prod)
✅ **Mobile App**: Expo running on both root and MeetopiaExpoApp
✅ **API Server**: `http://localhost:3003` (Dev) → `https://meetopiaapp.onrender.com` (Prod)

## 🌐 **Production URLs Setup**

### **Environment Variables Strategy:**

| Environment | Web URL | API URL | Mobile API |
|-------------|---------|---------|------------|
| **Development** | `http://localhost:4000` | `http://localhost:3003` | `http://localhost:3003` |
| **Production** | `https://meetopia.vercel.app` | `https://meetopiaapp.onrender.com` | `https://meetopiaapp.onrender.com` |

### **How It Works:**

1. **Next.js Web App** - Uses `next.config.js` to automatically switch URLs
2. **Mobile App** - Uses `__DEV__` flag to detect development vs production
3. **Server** - Deployed separately on Render.com

## 📲 **Mobile App Deployment**

### **Current Mobile Setup:**
- **Bundle ID**: `com.bferrell514.meetopiaapp`
- **Expo Project ID**: `37e69074-d079-4c60-a3c4-5d468645bcf1`
- **Deep Links**: `meetopia.vercel.app`

### **To Deploy Mobile:**

```bash
# 1. Build for production
cd MeetopiaExpoApp
npx expo build:ios    # iOS App Store
npx expo build:android # Google Play Store

# 2. Or use EAS Build (recommended)
npx eas build --platform ios
npx eas build --platform android
```

## 🌍 **Web App Deployment**

### **Vercel Deployment:**
```bash
# Already configured! Just push to main branch
git add .
git commit -m "Deploy to production"
git push origin main
```

**Vercel automatically:**
- Builds your Next.js app
- Uses production environment variables
- Deploys to `https://meetopia.vercel.app`

## 🔧 **Server Deployment (Render.com)**

Your server is already deployed at `https://meetopiaapp.onrender.com`

**Environment Variables on Render:**
```
DATABASE_URL=your-production-database
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
NODE_ENV=production
```

## 🔄 **How URL Switching Works**

### **Web App (`next.config.js`):**
```javascript
NEXT_PUBLIC_SOCKET_URL: process.env.NODE_ENV === 'production' 
  ? 'https://meetopiaapp.onrender.com'  // Production URL
  : 'http://localhost:3003'             // Development URL
```

### **Mobile App (`MeetopiaExpoApp/src/api/axios.ts`):**
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3003'              // Development URL
  : 'https://meetopiaapp.onrender.com';   // Production URL
```

## ✅ **You're Ready for Production!**

**Current Status:**
- ✅ Environment switching configured
- ✅ Production URLs set up
- ✅ Mobile app ready for app stores
- ✅ Web app ready for Vercel deployment
- ✅ Server deployed on Render.com

**To go live:**
1. **Web**: Push to main branch (auto-deploys to Vercel)
2. **Mobile**: Run `npx eas build` (submits to app stores)
3. **Server**: Already live at `https://meetopiaapp.onrender.com` 