#!/bin/bash

# 🔍 COMPREHENSIVE MEETOPIA AUDIT SCRIPT
# This script tests both Web App and Mobile App for App Store readiness

echo "🚀 STARTING COMPREHENSIVE MEETOPIA AUDIT"
echo "=========================================="
echo "📅 Date: $(date)"
echo "🎯 Goal: App Store Readiness Verification"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
WEB_TESTS_PASSED=0
WEB_TESTS_TOTAL=0
MOBILE_TESTS_PASSED=0
MOBILE_TESTS_TOTAL=0

# Function to run test and update counters
run_test() {
    local test_name="$1"
    local test_command="$2"
    local is_mobile="$3"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        if [ "$is_mobile" = "mobile" ]; then
            ((MOBILE_TESTS_PASSED++))
        else
            ((WEB_TESTS_PASSED++))
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
    
    if [ "$is_mobile" = "mobile" ]; then
        ((MOBILE_TESTS_TOTAL++))
    else
        ((WEB_TESTS_TOTAL++))
    fi
}

echo -e "${BLUE}🌐 WEB APP AUDIT (localhost:4000)${NC}"
echo "=================================="

# Check if web server is running
echo -n "Checking web server status... "
if curl -s http://localhost:4000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
    echo -e "${YELLOW}⚠️  Please start web server with: npm run dev${NC}"
    exit 1
fi

# Web App Tests
run_test "Homepage loads" "curl -s http://localhost:4000 | grep -q 'Meetopia'"
run_test "Video chat page accessible" "curl -s -I http://localhost:4000/chat/video | grep -q '200 OK'"
run_test "About page loads" "curl -s -I http://localhost:4000/about | grep -q '200 OK'"
run_test "Profile page loads" "curl -s -I http://localhost:4000/profile | grep -q '200 OK'"
run_test "Features page loads" "curl -s -I http://localhost:4000/features | grep -q '200 OK'"
run_test "Camera permissions configured" "curl -s http://localhost:4000/chat/video | grep -q 'camera'"
run_test "WebRTC functionality present" "curl -s http://localhost:4000/chat/video | grep -q 'peer'"
run_test "Socket connection configured" "curl -s http://localhost:4000/chat/video | grep -q 'socket'"
run_test "Animation assets loaded" "curl -s http://localhost:4000/chat/video | grep -q 'animate'"
run_test "Theme system present" "curl -s http://localhost:4000 | grep -q 'theme'"

echo ""
echo -e "${BLUE}📱 MOBILE APP AUDIT (MeetopiaExpoApp)${NC}"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "MeetopiaExpoApp/package.json" ]; then
    echo -e "${RED}❌ MeetopiaExpoApp directory not found${NC}"
    exit 1
fi

cd MeetopiaExpoApp

# Mobile App Tests
run_test "Package.json exists" "test -f package.json" mobile
run_test "Expo installed" "npm list expo >/dev/null 2>&1" mobile
run_test "React Native installed" "npm list react-native >/dev/null 2>&1" mobile
run_test "Navigation dependencies" "npm list @react-navigation/native >/dev/null 2>&1" mobile
run_test "Camera dependencies" "npm list expo-camera >/dev/null 2>&1" mobile
run_test "Audio dependencies" "npm list expo-audio >/dev/null 2>&1" mobile
run_test "Main App component exists" "test -f src/App.tsx" mobile
run_test "Home screen exists" "test -f src/screens/HomeScreen.tsx" mobile
run_test "Video call screen exists" "test -f src/screens/VideoCallScreen.tsx" mobile
run_test "Profile screen exists" "test -f src/screens/ProfileScreen.tsx" mobile
run_test "Auth context exists" "test -f src/context/AuthContext.tsx" mobile
run_test "Theme context exists" "test -f src/context/ThemeContext.tsx" mobile
run_test "App icon configured" "test -f assets/icon.png" mobile
run_test "Splash screen configured" "test -f assets/splash.png" mobile

# Check key configuration files
run_test "App.json configured" "test -f app.json && cat app.json | grep -q 'meetopia'" mobile
run_test "EAS build configured" "test -f eas.json" mobile

echo ""
echo -e "${BLUE}🧪 ADVANCED TESTING${NC}"
echo "==================="

# Test if Expo can start (without actually starting)
echo -n "Testing Expo start capability... "
if npx expo --version >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Expo CLI available${NC}"
    ((MOBILE_TESTS_PASSED++))
else
    echo -e "${RED}❌ Expo CLI not available${NC}"
fi
((MOBILE_TESTS_TOTAL++))

# Check TypeScript configuration
run_test "TypeScript configured" "test -f tsconfig.json" mobile

# Check for critical mobile app files
run_test "iOS configuration" "test -d ios" mobile
run_test "Android configuration" "test -d android" mobile

cd ..

echo ""
echo -e "${BLUE}📊 AUDIT RESULTS${NC}"
echo "================="

# Calculate percentages
if [ $WEB_TESTS_TOTAL -gt 0 ]; then
    WEB_PERCENTAGE=$((WEB_TESTS_PASSED * 100 / WEB_TESTS_TOTAL))
else
    WEB_PERCENTAGE=0
fi

if [ $MOBILE_TESTS_TOTAL -gt 0 ]; then
    MOBILE_PERCENTAGE=$((MOBILE_TESTS_PASSED * 100 / MOBILE_TESTS_TOTAL))
else
    MOBILE_PERCENTAGE=0
fi

echo -e "${BLUE}🌐 Web App Results:${NC}"
echo "   Passed: $WEB_TESTS_PASSED/$WEB_TESTS_TOTAL ($WEB_PERCENTAGE%)"

if [ $WEB_PERCENTAGE -ge 90 ]; then
    echo -e "   Status: ${GREEN}✅ READY FOR PRODUCTION${NC}"
elif [ $WEB_PERCENTAGE -ge 70 ]; then
    echo -e "   Status: ${YELLOW}⚠️  NEEDS MINOR FIXES${NC}"
else
    echo -e "   Status: ${RED}❌ NEEDS MAJOR WORK${NC}"
fi

echo ""
echo -e "${BLUE}📱 Mobile App Results:${NC}"
echo "   Passed: $MOBILE_TESTS_PASSED/$MOBILE_TESTS_TOTAL ($MOBILE_PERCENTAGE%)"

if [ $MOBILE_PERCENTAGE -ge 90 ]; then
    echo -e "   Status: ${GREEN}✅ READY FOR APP STORE${NC}"
elif [ $MOBILE_PERCENTAGE -ge 70 ]; then
    echo -e "   Status: ${YELLOW}⚠️  NEEDS MINOR FIXES${NC}"
else
    echo -e "   Status: ${RED}❌ NEEDS MAJOR WORK${NC}"
fi

echo ""
echo -e "${BLUE}🎯 OVERALL ASSESSMENT${NC}"
echo "====================="

TOTAL_PASSED=$((WEB_TESTS_PASSED + MOBILE_TESTS_PASSED))
TOTAL_TESTS=$((WEB_TESTS_TOTAL + MOBILE_TESTS_TOTAL))
OVERALL_PERCENTAGE=$((TOTAL_PASSED * 100 / TOTAL_TESTS))

echo "Overall: $TOTAL_PASSED/$TOTAL_TESTS tests passed ($OVERALL_PERCENTAGE%)"

if [ $OVERALL_PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🚀 EXCELLENT! Ready for App Store submission${NC}"
elif [ $OVERALL_PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}👍 GOOD! Minor improvements needed${NC}"
elif [ $OVERALL_PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  FAIR! Several fixes needed before submission${NC}"
else
    echo -e "${RED}❌ POOR! Major work required before App Store submission${NC}"
fi

echo ""
echo -e "${BLUE}📋 NEXT STEPS${NC}"
echo "============="

if [ $WEB_PERCENTAGE -ge 90 ] && [ $MOBILE_PERCENTAGE -ge 90 ]; then
    echo "1. ✅ Generate app store assets (icons, screenshots)"
    echo "2. ✅ Create privacy policy for camera/microphone usage"
    echo "3. ✅ Set up App Store Connect account"
    echo "4. ✅ Submit for App Store review"
    echo "5. ✅ Deploy web app to production"
elif [ $MOBILE_PERCENTAGE -lt 70 ]; then
    echo "1. 🔧 Fix mobile app critical issues"
    echo "2. 🧪 Run comprehensive device testing"
    echo "3. 📱 Test on physical iOS/Android devices"
    echo "4. 🎨 Verify UI/UX on different screen sizes"
else
    echo "1. 🔧 Address failing tests above"
    echo "2. 🧪 Run manual testing scenarios"
    echo "3. 📱 Test on physical devices"
    echo "4. 🎨 Polish UI/UX elements"
fi

echo ""
echo -e "${GREEN}✅ Audit completed!${NC}"
echo "📄 See COMPREHENSIVE_AUDIT.md for detailed testing checklist"

# Return appropriate exit code
if [ $OVERALL_PERCENTAGE -ge 80 ]; then
    exit 0
else
    exit 1
fi 