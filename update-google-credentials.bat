@echo off
echo.
echo ========================================
echo  PASTE YOUR NEW GOOGLE CREDENTIALS HERE
echo ========================================
echo.
set /p CLIENT_ID="Enter Google Client ID: "
set /p CLIENT_SECRET="Enter Google Client Secret: "

echo.
echo Updating frontend .env...
powershell -Command "(Get-Content 'frontend\.env') -replace 'REACT_APP_GOOGLE_CLIENT_ID=.*', 'REACT_APP_GOOGLE_CLIENT_ID=%CLIENT_ID%' | Set-Content 'frontend\.env'"

echo Updating backend application.properties...
powershell -Command "(Get-Content 'backend\src\main\resources\application.properties') -replace 'app.google.client-id=.*', 'app.google.client-id=%CLIENT_ID%' | Set-Content 'backend\src\main\resources\application.properties'"
powershell -Command "(Get-Content 'backend\src\main\resources\application.properties') -replace 'app.google.client-secret=.*', 'app.google.client-secret=%CLIENT_SECRET%' | Set-Content 'backend\src\main\resources\application.properties'"

echo.
echo ========================================
echo  ✅ CREDENTIALS UPDATED!
echo ========================================
echo.
echo Next steps:
echo 1. Restart servers: npm run dev
echo 2. Test at http://localhost:3000
echo.
pause
