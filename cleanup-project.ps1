# Safe Cleanup Script for realestate3 project
# This script moves potentially unnecessary files to a backup directory

# Create timestamp for the backup folder
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "project_cleanup_backup_$timestamp"

# Create backup directory
Write-Host "Creating backup directory: $backupDir" -ForegroundColor Green
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Function to safely move items to backup with proper structure
function SafeMove {
    param (
        [string]$sourcePath,
        [string]$description
    )
    
    if (Test-Path $sourcePath) {
        $destinationPath = Join-Path -Path $backupDir -ChildPath $sourcePath
        $destinationDir = Split-Path -Path $destinationPath -Parent
        
        # Create the directory structure in the backup folder
        if (-not (Test-Path $destinationDir)) {
            New-Item -Path $destinationDir -ItemType Directory -Force | Out-Null
        }
        
        # Move the item to backup
        Write-Host "Moving $description from $sourcePath to backup..." -ForegroundColor Yellow
        try {
            # For directories with many files, robocopy is more reliable than Move-Item
            if ((Get-Item $sourcePath).PSIsContainer) {
                # Create the directory in the backup
                if (-not (Test-Path $destinationPath)) {
                    New-Item -Path $destinationPath -ItemType Directory -Force | Out-Null
                }
                # Use robocopy to copy files (including hidden ones) - /E:copy subdirectories, /MOVE:move files, /NFL:no file list, /NDL:no directory list
                robocopy $sourcePath $destinationPath /E /MOVE /NFL /NDL /NJH /NJS /MT:8
                # Remove the source directory if it still exists and is empty
                if (Test-Path $sourcePath) {
                    if ((Get-ChildItem -Path $sourcePath -Force -Recurse).Count -eq 0) {
                        Remove-Item -Path $sourcePath -Force -Recurse -ErrorAction SilentlyContinue
                    }
                }
            } else {
                # For single files, use Move-Item
                Move-Item -Path $sourcePath -Destination $destinationDir -Force
            }
            Write-Host "  Done!" -ForegroundColor Green
        } catch {
            Write-Host "  Error moving $sourcePath. Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Warning: $sourcePath not found, skipping..." -ForegroundColor Red
    }
}

# Function to run cleanup tasks
function CleanupProject {
    # 1. Next.js build cache and artifacts (1+ GB)
    SafeMove -sourcePath ".next" -description "Next.js build cache"
    
    # 2. Firebase emulator data (not needed for production)
    SafeMove -sourcePath "emulator-data" -description "Firebase emulator data"
    
    # 3. Test coverage reports (can be regenerated)
    SafeMove -sourcePath "functions/coverage" -description "Test coverage reports"
    
    # 4. Duplicate and deprecated context folders
    SafeMove -sourcePath "context-DEPRECATED" -description "Deprecated context directory"
    
    # 5. Clean type checking cache
    SafeMove -sourcePath "tsconfig.tsbuildinfo" -description "TypeScript build info cache"
    
    # 6. Handle Next.js webpack cache issues by removing traces
    SafeMove -sourcePath ".next/trace" -description "Next.js trace logs"
    
    # 7. Cleanup unused config files (keep the .mjs version which seems to be newer)
    Write-Host "Checking for duplicate config files..." -ForegroundColor Yellow
    if ((Test-Path "next.config.js") -and (Test-Path "next.config.mjs")) {
        # Both config files exist, back up the .js one
        SafeMove -sourcePath "next.config.js" -description "Duplicate Next.js config"
    }
    
    # 8. List potentially duplicate files in context/contexts folders
    if ((Test-Path "context") -and (Test-Path "contexts")) {
        Write-Host "`nPotential duplicate context directories found:" -ForegroundColor Yellow
        Write-Host "context:" -ForegroundColor Cyan
        Get-ChildItem -Path "context" -Force | Format-Table Name, LastWriteTime
        Write-Host "contexts:" -ForegroundColor Cyan
        Get-ChildItem -Path "contexts" -Force | Format-Table Name, LastWriteTime
        
        # Ask if user wants to move one of these directories
        Write-Host "`nWarning: Moving these directories might break your application." -ForegroundColor Red
        $contextChoice = Read-Host "Do you want to move one of these directories? (type 'context', 'contexts', or 'none')"
        if ($contextChoice -eq "context") {
            SafeMove -sourcePath "context" -description "Duplicate context directory"
        } elseif ($contextChoice -eq "contexts") {
            SafeMove -sourcePath "contexts" -description "Duplicate contexts directory"
        }
    }
    
    # 9. Kill potentially stale Next.js development servers
    Write-Host "Checking for stale Next.js development servers..." -ForegroundColor Yellow
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($process in $nodeProcesses) {
        try {
            $commandLine = (Get-WmiObject -Class Win32_Process -Filter "ProcessId = $($process.Id)").CommandLine
            if ($commandLine -like "*next*dev*") {
                Write-Host "Found Next.js development server (PID: $($process.Id))" -ForegroundColor Yellow
                $killChoice = Read-Host "Do you want to kill this process? (y/n)"
                if ($killChoice -eq "y") {
                    Stop-Process -Id $process.Id -Force
                    Write-Host "  Process terminated." -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "  Error checking process $($process.Id): $_" -ForegroundColor Red
        }
    }
}

# Ask for confirmation before proceeding
Write-Host "This script will move potentially unnecessary files to a backup directory ($backupDir)." -ForegroundColor Cyan
Write-Host "Based on analysis, this could free up approximately 1.2+ GB of disk space." -ForegroundColor Cyan
Write-Host "You can restore these files later if needed." -ForegroundColor Cyan
$confirmation = Read-Host -Prompt "Do you want to proceed? (y/n)"

if ($confirmation -eq "y") {
    # Run the cleanup
    CleanupProject
    
    # Print summary
    Write-Host "`nCleanup operation completed!" -ForegroundColor Green
    
    # Calculate size of backup directory
    $backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Backup directory size: $([math]::Round($backupSize, 2)) MB" -ForegroundColor Green
    Write-Host "Files have been moved to: $backupDir" -ForegroundColor Green
    
    # Provide instructions to restore or delete backup
    Write-Host "`nTo restore specific files, move them back from the backup directory." -ForegroundColor Cyan
    Write-Host "To permanently delete the backup, run: Remove-Item -Path $backupDir -Recurse -Force" -ForegroundColor Cyan
    
    # Suggest running npm commands to verify the application still works
    Write-Host "`nSuggested next steps:" -ForegroundColor Magenta
    Write-Host "1. Run 'npm install' to ensure all dependencies are correctly installed" -ForegroundColor Magenta
    Write-Host "2. Run 'npm run dev' to verify the application starts correctly" -ForegroundColor Magenta
    Write-Host "3. If everything works, you can delete the backup directory" -ForegroundColor Magenta
} else {
    Write-Host "Operation cancelled by user." -ForegroundColor Red
} 