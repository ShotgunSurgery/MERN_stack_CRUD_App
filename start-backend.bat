@echo off
echo Starting MERN Stack Backend Server...
echo.
echo Make sure you have:
echo 1. Created a .env file in the backend directory
echo 2. MySQL server is running
echo 3. Database and tables are created
echo.
cd backend
echo Current directory: %CD%
echo.
echo Installing dependencies...
npm install
echo.
echo Starting server...
npm start
pause
