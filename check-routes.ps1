# Check important routes in the application
# This script verifies that key application routes are working after cleanup

$baseUrl = "http://localhost:3000"
$useCurl = $true  # Set to true to use curl instead of Invoke-WebRequest

function Check-Route {
    param (
        [string]$Route,
        [string]$Description,
        [bool]$AllowRedirect = $false
    )
    
    $url = "$baseUrl$Route"
    Write-Host "Checking $Description ($url)..." -ForegroundColor Yellow
    
    if ($useCurl) {
        try {
            $result = cmd /c "curl -s -o nul -w ""%{http_code}"" $url"
            if ($result -eq 200 -or ($AllowRedirect -and ($result -eq 307 -or $result -eq 302 -or $result -eq 301))) {
                Write-Host "  [OK] Status: $result" -ForegroundColor Green
                if ($result -ne 200) {
                    Write-Host "  [INFO] Redirect is expected for protected routes" -ForegroundColor Blue
                }
                return $true
            } else {
                Write-Host "  [WARN] Status: $result" -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "  [OK] Status: $($response.StatusCode)" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  [WARN] Status: $($response.StatusCode)" -ForegroundColor Red
                return $false
            }
        } catch {
            Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  [ERROR DETAILS] $($_)" -ForegroundColor Red
            return $false
        }
    }
}

# Routes to check
$routes = @(
    @{Route = "/"; Description = "Home Page"; AllowRedirect = $false},
    @{Route = "/dashboard"; Description = "Dashboard Main"; AllowRedirect = $true},
    @{Route = "/dashboard/superadmin"; Description = "SuperAdmin Dashboard"; AllowRedirect = $true},
    @{Route = "/dashboard/admin"; Description = "Admin Dashboard"; AllowRedirect = $true},
    @{Route = "/admin/analytics"; Description = "Admin Analytics"; AllowRedirect = $true},
    @{Route = "/auth/login"; Description = "Login Page"; AllowRedirect = $false},
    @{Route = "/auth/register"; Description = "Register Page"; AllowRedirect = $false}
)

# Check each route and count successes
$successCount = 0
$totalCount = $routes.Count

foreach ($route in $routes) {
    Write-Host "Testing route: $($route.Route)" -ForegroundColor Cyan
    $result = Check-Route -Route $route.Route -Description $route.Description -AllowRedirect $route.AllowRedirect
    if ($result) {
        $successCount++
        Write-Host "  [PASS] $($route.Description)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $($route.Description)" -ForegroundColor Red
    }
    Write-Host "--------------------------------------" -ForegroundColor Gray
}

# Show summary
Write-Host "`nRoute Check Summary:" -ForegroundColor Cyan
Write-Host "$successCount out of $totalCount routes accessible ($([math]::Round(($successCount/$totalCount*100), 0))%)" -ForegroundColor Cyan

if ($successCount -eq $totalCount) {
    Write-Host "`n✅ All routes are working properly!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Some routes have issues. You may need to fix additional components." -ForegroundColor Yellow
    Write-Host "Failed routes may need investigation. Check the server logs for details." -ForegroundColor Yellow
}

# Reminder about other potential issues that require manual verification
Write-Host "`nNote: This script only checks if pages load. Please manually verify:" -ForegroundColor Magenta
Write-Host "1. Authentication flows" -ForegroundColor Magenta
Write-Host "2. Form submissions" -ForegroundColor Magenta 
Write-Host "3. Data loading and persistence" -ForegroundColor Magenta 