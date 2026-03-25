@echo off
echo ==============================================
echo       Running All QuickSwap Unit Tests
echo ==============================================
echo.

go test -v -cover ./...

echo.
if %errorlevel% neq 0 (
    echo [ERROR] Some tests failed. Please review the output above.
    exit /b %errorlevel%
)

echo [SUCCESS] All tests passed!
pause
