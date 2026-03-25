Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "      Running All QuickSwap Unit Tests" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

go test -v -cover ./...

Write-Host ""
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Some tests failed. Please review the output above." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
