# PowerShell Test Script for Email + OTP Authentication

$BaseUrl = "http://localhost:9090"
$Email = Read-Host "Enter email address to test"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Email + OTP Authentication Test (Fixed)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Send OTP
Write-Host "Step 1: Sending OTP to $Email..." -ForegroundColor Yellow

$sendBody = @{
    email = $Email
} | ConvertTo-Json

try {
    $sendResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/email/send-otp" `
        -Method Post `
        -ContentType "application/json" `
        -Body $sendBody
    
    if ($sendResponse.success) {
        Write-Host "✅ OTP sent successfully!" -ForegroundColor Green
        Write-Host "📧 Check your email inbox for the OTP code`n" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to send OTP: $($sendResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get OTP from user and verify (NO password yet)
$OtpCode = Read-Host "`nStep 2: Enter the OTP code from your email"

Write-Host "`nVerifying OTP..." -ForegroundColor Yellow

$verifyBody = @{
    email = $Email
    otp = $OtpCode
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/email/verify-otp" `
        -Method Post `
        -ContentType "application/json" `
        -Body $verifyBody
    
    if ($verifyResponse.success) {
        Write-Host "✅ OTP verified successfully!" -ForegroundColor Green
        
        if ($verifyResponse.data.nextStep -eq "continue_action") {
            Write-Host "`n✅ Existing user - Login complete!" -ForegroundColor Green
            Write-Host "User ID: $($verifyResponse.data.userId)" -ForegroundColor White
            Write-Host "Display Name: $($verifyResponse.data.displayName)" -ForegroundColor White
            Write-Host "Email: $($verifyResponse.data.email)" -ForegroundColor White
            exit 0
        } elseif ($verifyResponse.data.nextStep -eq "set_password") {
            Write-Host "`n🔐 New user - Need to set password" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ OTP verification failed: $($verifyResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Set password (new users only, OTP NOT sent again)
Write-Host "`nStep 3: Setting up your account..." -ForegroundColor Yellow

$setPasswordBody = @{
    email = $Email
    password = "TestPassword123"
    displayName = "Test User"
} | ConvertTo-Json

try {
    $passwordResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/email/set-password" `
        -Method Post `
        -ContentType "application/json" `
        -Body $setPasswordBody
    
    if ($passwordResponse.success) {
        Write-Host "✅ Account created successfully!" -ForegroundColor Green
        Write-Host "User ID: $($passwordResponse.data.userId)" -ForegroundColor White
        Write-Host "Display Name: $($passwordResponse.data.displayName)" -ForegroundColor White
        Write-Host "Email: $($passwordResponse.data.email)" -ForegroundColor White
        Write-Host "Auth Provider: $($passwordResponse.data.authProvider)" -ForegroundColor White
    } else {
        Write-Host "❌ Password setup failed: $($passwordResponse.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Email + OTP Flow Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
