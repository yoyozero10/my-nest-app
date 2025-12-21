# Test Permission System

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING PERMISSION SYSTEM" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login as USER
Write-Host "[1] Logging in as USER..." -ForegroundColor Yellow
$userResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -InFile "test-user-login.json"
$userToken = $userResponse.data.access_token

Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  Permissions:" $userResponse.data.user.permissions.Count
$userResponse.data.user.permissions | ForEach-Object {
    Write-Host "    - $($_.method) $($_.apiPath)" -ForegroundColor Gray
}

# Try to create job as USER
Write-Host "`n[2] Trying to CREATE JOB as USER..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/jobs" -Method POST -Headers @{
        "Authorization" = "Bearer $userToken"
        "Content-Type" = "application/json"
    } -InFile "test-create-job.json"
    
    Write-Host "✗ FAIL: Job created successfully!" -ForegroundColor Red
    Write-Host "  This should NOT happen - USER should not have permission" -ForegroundColor Red
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ SUCCESS: Request blocked!" -ForegroundColor Green
    Write-Host "  Status:" $error.statusCode -ForegroundColor Gray
    Write-Host "  Message:" $error.message -ForegroundColor Gray
}

# Login as HR
Write-Host "`n[3] Logging in as HR..." -ForegroundColor Yellow
$hrResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -InFile "test-hr-login.json"
$hrToken = $hrResponse.data.access_token

Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  Permissions:" $hrResponse.data.user.permissions.Count
Write-Host "  (showing first 5)" -ForegroundColor Gray
$hrResponse.data.user.permissions | Select-Object -First 5 | ForEach-Object {
    Write-Host "    - $($_.method) $($_.apiPath)" -ForegroundColor Gray
}

# Try to create job as HR
Write-Host "`n[4] Trying to CREATE JOB as HR..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/jobs" -Method POST -Headers @{
        "Authorization" = "Bearer $hrToken"
        "Content-Type" = "application/json"
    } -InFile "test-create-job.json"
    
    Write-Host "✓ SUCCESS: Job created!" -ForegroundColor Green
    Write-Host "  Job ID:" $result.data._id -ForegroundColor Gray
    Write-Host "  Job Name:" $result.data.name -ForegroundColor Gray
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✗ FAIL: Request blocked!" -ForegroundColor Red
    Write-Host "  Status:" $error.statusCode -ForegroundColor Gray
    Write-Host "  Message:" $error.message -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
