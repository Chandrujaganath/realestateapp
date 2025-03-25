# Create necessary directories for the new architecture
# Features
$features = @("auth", "projects", "tasks", "users", "announcements", "visits")
$subfolders = @("hooks", "services", "components", "types")

# Create the services directory
New-Item -Path "services" -ItemType Directory -Force

# Create the providers directory
New-Item -Path "providers" -ItemType Directory -Force

# Create feature folders and their subfolders
foreach ($feature in $features) {
    $featurePath = "features\$feature"
    New-Item -Path $featurePath -ItemType Directory -Force
    
    foreach ($subfolder in $subfolders) {
        $subfolderPath = "$featurePath\$subfolder"
        New-Item -Path $subfolderPath -ItemType Directory -Force
    }
    
    # Add a providers subfolder only to auth feature
    if ($feature -eq "auth") {
        New-Item -Path "$featurePath\providers" -ItemType Directory -Force
    }
}

# Create common component directories
$componentFolders = @(
    "components\common\layout",
    "components\common\navigation",
    "components\ui\forms",
    "components\ui\data-display"
)

foreach ($folder in $componentFolders) {
    New-Item -Path $folder -ItemType Directory -Force
}

Write-Host "Directory structure created successfully!" 