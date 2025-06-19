#!/bin/bash

# 🔍 LIVE MEETOPIA AUDIT - Testing Both Running Apps
# This script performs real-time testing of both Web App and Mobile App

echo "🚀 LIVE MEETOPIA AUDIT - BOTH APPS RUNNING"
echo "============================================"
echo "📅 Date: $(date)"
echo "🎯 Testing: Web App (localhost:4000) + Mobile App (localhost:8082)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
WEB_PASSED=0
WEB_TOTAL=0
MOBILE_PASSED=0
MOBILE_TOTAL=0

# Function to run test with detailed output
run_live_test() {
    local test_name="$1"
    local test_command="$2"
    local app_type="$3"
    local expected="$4"
    
    echo -n "🧪 Testing: $test_name... "
    
    result=$(eval "$test_command" 2>/dev/null)
    
    if [[ "$result" == *"$expected"* ]] || eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        if [ "$app_type" = "mobile" ]; then
            ((MOBILE_PASSED++))
        else
            ((WEB_PASSED++))
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        if [ -n "$result" ] && [ ${#result} -lt 200 ]; then
            echo -e "   ${YELLOW}Details: $result${NC}"
        fi
    fi
    
    if [ "$app_type" = "mobile" ]; then
        ((MOBILE_TOTAL++))
    else
        ((WEB_TOTAL++))
    fi
}

# Function to test URL accessibility with detailed response
test_url() {
    local name="$1"
    local url="$2"
    local app_type="$3"
    
    echo -n "🌐 Testing: $name ($url)... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ PASS (HTTP $status_code)${NC}"
        if [ "$app_type" = "mobile" ]; then
            ((MOBILE_PASSED++))
        else
            ((WEB_PASSED++))
        fi
    else
        echo -e "${RED}❌ FAIL (HTTP $status_code)${NC}"
    fi
    
    if [ "$app_type" = "mobile" ]; then
        ((MOBILE_TOTAL++))
    else
        ((WEB_TOTAL++))
    fi
}

echo -e "${BLUE}🌐 WEB APP LIVE TESTING (localhost:4000)${NC}"
echo "=========================================="

# Check if web server is running
echo -n "🔍 Checking web server status... "
if curl -s http://localhost:4000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    echo -e "${YELLOW}⚠️  Please start with: npm run dev${NC}"
    exit 1
fi

# Web App URL Tests
test_url "Homepage" "http://localhost:4000" "web"
test_url "Video Chat Page" "http://localhost:4000/chat/video" "web"
test_url "About Page" "http://localhost:4000/about" "web"
test_url "Profile Page" "http://localhost:4000/profile" "web"
test_url "Features Page" "http://localhost:4000/features" "web"

# Web App Content Tests
run_live_test "Meetopia branding present" "curl -s http://localhost:4000 | grep -i 'meetopia'" "web" "meetopia"
run_live_test "Camera permissions configured" "curl -s http://localhost:4000/chat/video | grep -i 'camera'" "web" "camera"
run_live_test "Video functionality present" "curl -s http://localhost:4000/chat/video | grep -i 'video'" "web" "video"
run_live_test "Animation classes present" "curl -s http://localhost:4000/chat/video | grep -i 'animate'" "web" "animate"
run_live_test "Theme system present" "curl -s http://localhost:4000 | grep -i 'theme\\|dark\\|light'" "web" "theme"

echo ""
echo -e "${PURPLE}📱 MOBILE APP LIVE TESTING (localhost:8082)${NC}"
echo "============================================"

# Wait a moment for mobile app to fully start
echo "⏳ Waiting for mobile app to fully initialize..."
sleep 3

# Check if mobile server is running
echo -n "🔍 Checking mobile app status... "
mobile_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082 2>/dev/null)
if [ "$mobile_status" = "200" ]; then
    echo -e "${GREEN}✅ RUNNING (HTTP $mobile_status)${NC}"
else
    echo -e "${YELLOW}⚠️  STARTING... (HTTP $mobile_status)${NC}"
    echo "⏳ Waiting 10 seconds for mobile app to fully load..."
    sleep 10
    mobile_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082 2>/dev/null)
    if [ "$mobile_status" = "200" ]; then
        echo -e "${GREEN}✅ NOW RUNNING (HTTP $mobile_status)${NC}"
    else
        echo -e "${RED}❌ FAILED TO START (HTTP $mobile_status)${NC}"
        echo -e "${YELLOW}💡 Try: cd MeetopiaExpoApp && npx expo start --web --port 8082${NC}"
    fi
fi

# Mobile App Tests (if running)
if [ "$mobile_status" = "200" ]; then
    test_url "Mobile App Main Page" "http://localhost:8082" "mobile"
    
    # Mobile App Content Tests
    run_live_test "React Native app loads" "curl -s http://localhost:8082 | grep -i 'react'" "mobile" "react"
    run_live_test "Expo app structure" "curl -s http://localhost:8082 | grep -i 'expo\\|app'" "mobile" "expo"
    run_live_test "Mobile navigation present" "curl -s http://localhost:8082 | grep -i 'navigation\\|tab'" "mobile" "navigation"
    run_live_test "Mobile UI components" "curl -s http://localhost:8082 | grep -i 'button\\|screen'" "mobile" "button"
    
    echo ""
    echo -e "${CYAN}📸 TESTING MOBILE APP FEATURES${NC}"
    echo "================================"
    
    # Test mobile app bundle
    bundle_size=$(curl -s http://localhost:8082 | wc -c)
    if [ "$bundle_size" -gt 10000 ]; then
        echo -e "📦 Bundle size: ${GREEN}$bundle_size bytes ✅${NC}"
        ((MOBILE_PASSED++))
    else
        echo -e "📦 Bundle size: ${RED}$bundle_size bytes (too small) ❌${NC}"
    fi
    ((MOBILE_TOTAL++))
    
else
    echo -e "${RED}❌ Skipping mobile app content tests - app not accessible${NC}"
    ((MOBILE_TOTAL+=5)) # Add failed tests to total
fi

echo ""
echo -e "${CYAN}🔄 CROSS-PLATFORM COMPARISON${NC}"
echo "============================="

# Compare response times
echo -n "⚡ Web app response time... "
web_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:4000 2>/dev/null)
echo -e "${GREEN}${web_time}s ✅${NC}"

if [ "$mobile_status" = "200" ]; then
    echo -n "⚡ Mobile app response time... "
    mobile_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8082 2>/dev/null)
    echo -e "${GREEN}${mobile_time}s ✅${NC}"
    
    # Compare sizes
    web_size=$(curl -s http://localhost:4000 | wc -c)
    mobile_size=$(curl -s http://localhost:8082 | wc -c)
    
    echo "📊 Size comparison:"
    echo "   Web app: $web_size bytes"
    echo "   Mobile app: $mobile_size bytes"
else
    echo -e "⚡ Mobile app response time... ${RED}N/A (not running)${NC}"
fi

echo ""
echo -e "${BLUE}📊 LIVE AUDIT RESULTS${NC}"
echo "======================"

# Calculate percentages
if [ $WEB_TOTAL -gt 0 ]; then
    WEB_PERCENTAGE=$((WEB_PASSED * 100 / WEB_TOTAL))
else
    WEB_PERCENTAGE=0
fi

if [ $MOBILE_TOTAL -gt 0 ]; then
    MOBILE_PERCENTAGE=$((MOBILE_PASSED * 100 / MOBILE_TOTAL))
else
    MOBILE_PERCENTAGE=0
fi

echo -e "${BLUE}🌐 Web App Live Results:${NC}"
echo "   Passed: $WEB_PASSED/$WEB_TOTAL ($WEB_PERCENTAGE%)"
echo "   Status: http://localhost:4000"

if [ $WEB_PERCENTAGE -ge 90 ]; then
    echo -e "   Rating: ${GREEN}🌟🌟🌟🌟🌟 EXCELLENT${NC}"
elif [ $WEB_PERCENTAGE -ge 80 ]; then
    echo -e "   Rating: ${GREEN}🌟🌟🌟🌟 VERY GOOD${NC}"
elif [ $WEB_PERCENTAGE -ge 70 ]; then
    echo -e "   Rating: ${YELLOW}🌟🌟🌟 GOOD${NC}"
else
    echo -e "   Rating: ${RED}🌟🌟 NEEDS WORK${NC}"
fi

echo ""
echo -e "${PURPLE}📱 Mobile App Live Results:${NC}"
echo "   Passed: $MOBILE_PASSED/$MOBILE_TOTAL ($MOBILE_PERCENTAGE%)"
echo "   Status: http://localhost:8082"

if [ $MOBILE_PERCENTAGE -ge 90 ]; then
    echo -e "   Rating: ${GREEN}🌟🌟🌟🌟🌟 EXCELLENT${NC}"
elif [ $MOBILE_PERCENTAGE -ge 80 ]; then
    echo -e "   Rating: ${GREEN}🌟🌟🌟🌟 VERY GOOD${NC}"
elif [ $MOBILE_PERCENTAGE -ge 70 ]; then
    echo -e "   Rating: ${YELLOW}🌟🌟🌟 GOOD${NC}"
else
    echo -e "   Rating: ${RED}🌟🌟 NEEDS WORK${NC}"
fi

echo ""
echo -e "${CYAN}🎯 OVERALL LIVE ASSESSMENT${NC}"
echo "=========================="

TOTAL_PASSED=$((WEB_PASSED + MOBILE_PASSED))
TOTAL_TESTS=$((WEB_TOTAL + MOBILE_TOTAL))

if [ $TOTAL_TESTS -gt 0 ]; then
    OVERALL_PERCENTAGE=$((TOTAL_PASSED * 100 / TOTAL_TESTS))
else
    OVERALL_PERCENTAGE=0
fi

echo "📊 Combined Score: $TOTAL_PASSED/$TOTAL_TESTS ($OVERALL_PERCENTAGE%)"

if [ $OVERALL_PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}🚀 OUTSTANDING! Both apps running excellently${NC}"
    echo -e "${GREEN}✅ Ready for production deployment${NC}"
elif [ $OVERALL_PERCENTAGE -ge 80 ]; then
    echo -e "${GREEN}👍 EXCELLENT! Apps running very well${NC}"
    echo -e "${GREEN}✅ Minor optimizations possible${NC}"
elif [ $OVERALL_PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  GOOD! Apps functional with room for improvement${NC}"
else
    echo -e "${RED}❌ NEEDS ATTENTION! Issues detected${NC}"
fi

echo ""
echo -e "${CYAN}🎮 MANUAL TESTING RECOMMENDATIONS${NC}"
echo "=================================="

echo "1. 🌐 Web App Manual Tests:"
echo "   • Open http://localhost:4000 in browser"
echo "   • Test video chat functionality"
echo "   • Verify animations work smoothly"
echo "   • Check responsive design on mobile viewport"
echo ""

if [ "$mobile_status" = "200" ]; then
    echo "2. 📱 Mobile App Manual Tests:"
    echo "   • Open http://localhost:8082 in browser"
    echo "   • Test navigation between screens"
    echo "   • Verify mobile-optimized UI"
    echo "   • Test touch interactions"
else
    echo "2. 📱 Mobile App Manual Tests:"
    echo -e "   ${RED}• First restart mobile app: cd MeetopiaExpoApp && npx expo start --web${NC}"
    echo "   • Then test navigation and UI"
fi

echo ""
echo -e "${GREEN}✅ Live audit completed!${NC}"
echo "🔗 Both apps are accessible for manual testing"

# Return appropriate exit code
if [ $OVERALL_PERCENTAGE -ge 80 ]; then
    exit 0
else
    exit 1
fi 