# Comprehensive Permission Test for USER role
# USER should ONLY have 4 permissions

Write-Host "`n" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE PERMISSION TEST - USER ROLE" -ForegroundColor Cyan
Write-Host "  Expected: USER has exactly 4 permissions" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Login as USER
Write-Host "[SETUP] Logging in as USER..." -ForegroundColor Yellow
$userResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -InFile "test-user-login.json"
$userToken = $userResponse.data.access_token
$permissions = $userResponse.data.user.permissions

Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  User:" $userResponse.data.user.name
Write-Host "  Email:" $userResponse.data.user.email
Write-Host "  Permissions count:" $permissions.Count
Write-Host ""

# Display permissions
Write-Host "USER Permissions:" -ForegroundColor Cyan
$permissions | ForEach-Object {
    Write-Host "  ✓ $($_.method) $($_.apiPath)" -ForegroundColor Gray
}
Write-Host ""

# Test counters
$passCount = 0
$failCount = 0

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Url,
        [string]$Token,
        [bool]$ShouldSucceed,
        [string]$Body = $null
    )
    
    Write-Host "[$TestName]" -ForegroundColor Yellow -NoNewline
    Write-Host " $Method $Url" -ForegroundColor Gray
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $result = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body -ErrorAction Stop
        } else {
            $result = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -ErrorAction Stop
        }
        
        if ($ShouldSucceed) {
            Write-Host "  ✅ PASS: Request succeeded (as expected)" -ForegroundColor Green
            $script:passCount++
        } else {
            Write-Host "  ❌ FAIL: Request succeeded but should have been blocked!" -ForegroundColor Red
            $script:failCount++
        }
    } catch {
        $err = $_.ErrorDetails.Message | ConvertFrom-Json
        
        if (-not $ShouldSucceed -and $err.statusCode -eq 403) {
            Write-Host "  ✅ PASS: Request blocked with 403 (as expected)" -ForegroundColor Green
            $script:passCount++
        } else {
            Write-Host "  ❌ FAIL: Unexpected error - $($err.message)" -ForegroundColor Red
            $script:failCount++
        }
    }
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TESTING ALLOWED PERMISSIONS (Should SUCCEED)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: GET /api/v1/jobs (ALLOWED)
Test-Endpoint -TestName "Test 1" -Method "GET" -Url "http://localhost:8000/api/v1/jobs?current=1&pageSize=5" -Token $userToken -ShouldSucceed $true

# Test 2: GET /api/v1/jobs/:id (ALLOWED)
# First, get a job ID
$jobs = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/jobs?current=1&pageSize=1" -Method GET
if ($jobs.data.result.Count -gt 0) {
    $jobId = $jobs.data.result[0]._id
    Test-Endpoint -TestName "Test 2" -Method "GET" -Url "http://localhost:8000/api/v1/jobs/$jobId" -Token $userToken -ShouldSucceed $true
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TESTING FORBIDDEN PERMISSIONS (Should FAIL with 403)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: POST /api/v1/jobs (FORBIDDEN)
$jobData = @{
    name = "Test Job"
    skills = @("Test")
    company = @{
        _id = "676692bdbd6c11502ef1db79"
        name = "Test Company"
    }
    salary = 10000000
    quantity = 1
    level = "JUNIOR"
    description = "Test"
    startDate = "2025-01-01T00:00:00.000Z"
    endDate = "2025-03-01T00:00:00.000Z"
    isActive = $true
} | ConvertTo-Json

Test-Endpoint -TestName "Test 3" -Method "POST" -Url "http://localhost:8000/api/v1/jobs" -Token $userToken -ShouldSucceed $false -Body $jobData

# Test 4: PATCH /api/v1/jobs/:id (FORBIDDEN)
if ($jobs.data.result.Count -gt 0) {
    $jobId = $jobs.data.result[0]._id
    $updateData = @{ name = "Updated Job" } | ConvertTo-Json
    Test-Endpoint -TestName "Test 4" -Method "PATCH" -Url "http://localhost:8000/api/v1/jobs/$jobId" -Token $userToken -ShouldSucceed $false -Body $updateData
}

# Test 5: DELETE /api/v1/jobs/:id (FORBIDDEN)
if ($jobs.data.result.Count -gt 0) {
    $jobId = $jobs.data.result[0]._id
    Test-Endpoint -TestName "Test 5" -Method "DELETE" -Url "http://localhost:8000/api/v1/jobs/$jobId" -Token $userToken -ShouldSucceed $false
}

# Test 6: POST /api/v1/companies (FORBIDDEN)
$companyData = @{
    name = "Test Company"
    address = "Test Address"
    description = "Test Description"
} | ConvertTo-Json

Test-Endpoint -TestName "Test 6" -Method "POST" -Url "http://localhost:8000/api/v1/companies" -Token $userToken -ShouldSucceed $false -Body $companyData

# Test 7: GET /api/v1/companies (FORBIDDEN)
Test-Endpoint -TestName "Test 7" -Method "GET" -Url "http://localhost:8000/api/v1/companies?current=1&pageSize=5" -Token $userToken -ShouldSucceed $false

# Test 8: POST /api/v1/users (FORBIDDEN)
$userData = @{
    name = "Test User"
    email = "testuser@gmail.com"
    password = "123456"
    age = 25
    gender = "Male"
    address = "Test Address"
    role = "676692bdbd6c11502ef1db79"
} | ConvertTo-Json

Test-Endpoint -TestName "Test 8" -Method "POST" -Url "http://localhost:8000/api/v1/users" -Token $userToken -ShouldSucceed $false -Body $userData

# Test 9: GET /api/v1/users (FORBIDDEN)
Test-Endpoint -TestName "Test 9" -Method "GET" -Url "http://localhost:8000/api/v1/users?current=1&pageSize=5" -Token $userToken -ShouldSucceed $false

# Test 10: GET /api/v1/permissions (FORBIDDEN)
Test-Endpoint -TestName "Test 10" -Method "GET" -Url "http://localhost:8000/api/v1/permissions?current=1&pageSize=5" -Token $userToken -ShouldSucceed $false

# Test 11: GET /api/v1/roles (FORBIDDEN)
Test-Endpoint -TestName "Test 11" -Method "GET" -Url "http://localhost:8000/api/v1/roles?current=1&pageSize=5" -Token $userToken -ShouldSucceed $false

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests:" ($passCount + $failCount)
Write-Host "Passed:" $passCount -ForegroundColor Green
Write-Host "Failed:" $failCount -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Permissions are working correctly!" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED! Please review the results above." -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
