# Fix imports after context directory restructuring
# This script will look for imports from @/context/* or @/contexts/*

# What this script does:
# 1. Scans all TypeScript files for imports from @/context/* or @/contexts/*
# 2. Creates a report of files that need fixing
# 3. Optionally updates the imports to use a consistent pattern

# Configuration
$targetDirectory = "."  # Root directory to scan
$filePattern = "*.tsx", "*.ts"  # File patterns to search
$oldImportPath = "@/context/"  # Original import path to replace
$newImportPath = "@/contexts/"  # New import path to use
$dryRun = $true  # Set to false to actually modify files

function Find-ImportsToFix {
    $results = @()
    
    Get-ChildItem -Path $targetDirectory -Include $filePattern -Recurse | ForEach-Object {
        $file = $_
        $content = Get-Content -Path $file.FullName -Raw
        
        # Check for context imports
        if ($content -match $oldImportPath) {
            $lineNumber = 0
            $matches = @()
            
            Get-Content -Path $file.FullName | ForEach-Object {
                $lineNumber++
                if ($_ -match $oldImportPath) {
                    $matches += @{
                        LineNumber = $lineNumber
                        Line = $_
                        ImportPath = $oldImportPath
                    }
                }
            }
            
            $results += @{
                File = $file.FullName
                Matches = $matches
            }
        }
    }
    
    return $results
}

function Update-ImportPaths {
    param (
        [array]$FilesToFix
    )
    
    foreach ($fileInfo in $FilesToFix) {
        $filePath = $fileInfo.File
        Write-Host "Updating file: $filePath" -ForegroundColor Yellow
        
        $content = Get-Content -Path $filePath -Raw
        $updatedContent = $content -replace $oldImportPath, $newImportPath
        
        if ($dryRun) {
            Write-Host "  [DRY RUN] File would be updated" -ForegroundColor Cyan
        } else {
            Set-Content -Path $filePath -Value $updatedContent
            Write-Host "  File updated successfully" -ForegroundColor Green
        }
    }
}

# Main script execution
Write-Host "Scanning for imports that need to be fixed..." -ForegroundColor Cyan
$filesToFix = Find-ImportsToFix

if ($filesToFix.Count -eq 0) {
    Write-Host "No files found with imports that need fixing." -ForegroundColor Green
    exit 0
}

# Display results
Write-Host "`nFound $($filesToFix.Count) files with imports that need to be fixed:" -ForegroundColor Yellow
foreach ($fileInfo in $filesToFix) {
    Write-Host "File: $($fileInfo.File)" -ForegroundColor White
    foreach ($match in $fileInfo.Matches) {
        Write-Host "  Line $($match.LineNumber): $($match.Line)" -ForegroundColor Gray
    }
}

# Confirm update
if ($dryRun) {
    Write-Host "`nThis is a dry run. No files will be modified." -ForegroundColor Cyan
    $confirm = Read-Host "Would you like to update these files? (y/n)"
    if ($confirm -eq "y") {
        $dryRun = $false
        Update-ImportPaths -FilesToFix $filesToFix
    } else {
        Write-Host "No files were modified." -ForegroundColor Yellow
    }
} else {
    $confirm = Read-Host "Are you sure you want to update these files? (y/n)"
    if ($confirm -eq "y") {
        Update-ImportPaths -FilesToFix $filesToFix
    } else {
        Write-Host "No files were modified." -ForegroundColor Yellow
    }
}

# Provide instructions for rebuilding
Write-Host "`nAfter updating import paths, run the following to rebuild your application:" -ForegroundColor Magenta
Write-Host "1. npm run dev" -ForegroundColor Magenta 