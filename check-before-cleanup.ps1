# Check Before Cleanup Script
# This script analyzes what would be removed by cleanup-project.ps1 without making any changes

function Get-DirSize {
    param (
        [string]$Path
    )
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        return $size
    } else {
        return 0
    }
}

function Format-FileSize {
    param (
        [long]$Size
    )
    
    if ($Size -ge 1GB) {
        return "$([math]::Round($Size / 1GB, 2)) GB"
    } elseif ($Size -ge 1MB) {
        return "$([math]::Round($Size / 1MB, 2)) MB"
    } elseif ($Size -ge 1KB) {
        return "$([math]::Round($Size / 1KB, 2)) KB"
    } else {
        return "$Size bytes"
    }
}

# Output header
Write-Host "=== Project Cleanup Analysis ===" -ForegroundColor Cyan
Write-Host "This script will analyze what would be removed by cleanup-project.ps1 without making changes.`n" -ForegroundColor Cyan

# Initialize total size
$totalSize = 0

# Create an array of items to check
$itemsToCheck = @(
    @{Path = ".next"; Description = "Next.js build cache"; Essential = $false},
    @{Path = "emulator-data"; Description = "Firebase emulator data"; Essential = $false},
    @{Path = "functions/coverage"; Description = "Test coverage reports"; Essential = $false},
    @{Path = "context-DEPRECATED"; Description = "Deprecated context directory"; Essential = $false},
    @{Path = "tsconfig.tsbuildinfo"; Description = "TypeScript build info cache"; Essential = $false}
)

# Check each item
Write-Host "Items that would be moved to backup:" -ForegroundColor Yellow
foreach ($item in $itemsToCheck) {
    $size = Get-DirSize -Path $item.Path
    $totalSize += $size
    $formattedSize = Format-FileSize -Size $size
    
    if (Test-Path $item.Path) {
        Write-Host "  [FOUND] $($item.Path) - $formattedSize" -ForegroundColor Green
        Write-Host "          $($item.Description)" -ForegroundColor Gray
    } else {
        Write-Host "  [NOT FOUND] $($item.Path)" -ForegroundColor DarkGray
    }
}

# Check for duplicate Next.js config files
if ((Test-Path "next.config.js") -and (Test-Path "next.config.mjs")) {
    $jsSize = (Get-Item "next.config.js").Length
    $totalSize += $jsSize
    Write-Host "  [FOUND] next.config.js - $(Format-FileSize -Size $jsSize)" -ForegroundColor Green
    Write-Host "          Duplicate Next.js config (next.config.mjs exists)" -ForegroundColor Gray
}

# Check context directories
if ((Test-Path "context") -and (Test-Path "contexts")) {
    $contextSize = Get-DirSize -Path "context"
    $contextsSize = Get-DirSize -Path "contexts"
    
    Write-Host "`nPotential duplicate context directories:" -ForegroundColor Yellow
    Write-Host "  - context/ - $(Format-FileSize -Size $contextSize)" -ForegroundColor Cyan
    Write-Host "  - contexts/ - $(Format-FileSize -Size $contextsSize)" -ForegroundColor Cyan
    
    Write-Host "`  Files in context/:" -ForegroundColor White
    Get-ChildItem -Path "context" -Force | Format-Table Name, LastWriteTime
    
    Write-Host "`  Files in contexts/:" -ForegroundColor White
    Get-ChildItem -Path "contexts" -Force | Format-Table Name, LastWriteTime
    
    Write-Host "  NOTE: You would be prompted to choose which one to move during actual cleanup." -ForegroundColor Yellow
}

# Check for stale Next.js development servers
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$nextDevServers = 0
foreach ($process in $nodeProcesses) {
    try {
        $commandLine = (Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
        if ($commandLine -like "*next*dev*") {
            $nextDevServers++
        }
    } catch {
        # Ignore errors
    }
}

if ($nextDevServers -gt 0) {
    Write-Host "`nFound $nextDevServers stale Next.js development server(s)" -ForegroundColor Yellow
    Write-Host "  During cleanup, you'll be prompted whether to terminate these processes." -ForegroundColor Yellow
}

# Output summary
$formattedTotalSize = Format-FileSize -Size $totalSize
Write-Host "`nTotal space that would be freed: $formattedTotalSize" -ForegroundColor Green

# Note that this is excluding one of context/contexts directories in the calculation
Write-Host "`nNext steps:" -ForegroundColor Magenta
Write-Host "1. To proceed with cleaning up these files, run: .\cleanup-project.ps1" -ForegroundColor Magenta
Write-Host "2. The cleanup script will create a backup of all moved files." -ForegroundColor Magenta
Write-Host "3. You'll be prompted for confirmation before any changes are made." -ForegroundColor Magenta 