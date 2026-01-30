#!/bin/bash

# Quick Test Script for Email + OTP Authentication
# This script tests the Email+OTP flow with Brevo integration

BASE_URL="http://localhost:9090"
EMAIL="test@example.com"

echo "=================================="
echo "Email + OTP Authentication Test"
echo "=================================="
echo ""

# Step 1: Send OTP
echo "Step 1: Sending OTP to $EMAIL..."
SEND_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/email/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")

echo "Response: $SEND_RESPONSE"
echo ""

# Check if OTP was sent successfully
if echo "$SEND_RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ OTP sent successfully!"
    echo "📧 Check your email inbox for the OTP code"
else
    echo "❌ Failed to send OTP"
    exit 1
fi

echo ""
echo "Step 2: Enter the OTP code from your email"
read -p "OTP Code: " OTP_CODE

# Step 3: Verify OTP (New User Signup)
echo ""
echo "Step 3: Verifying OTP and creating account..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/email/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$EMAIL\",
    \"otp\":\"$OTP_CODE\",
    \"isSignup\":true,
    \"password\":\"TestPassword123\",
    \"displayName\":\"Test User\"
  }")

echo "Response: $VERIFY_RESPONSE"
echo ""

# Check if verification was successful
if echo "$VERIFY_RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ OTP verified and account created successfully!"
    
    # Extract userId from response
    USER_ID=$(echo "$VERIFY_RESPONSE" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
    echo "User ID: $USER_ID"
else
    echo "❌ OTP verification failed"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ Email + OTP Test Complete!"
echo "=================================="
