# Make sure Firebase emulators are installed
Write-Host "Installing Firebase emulators..."
firebase setup:emulators:firestore
firebase setup:emulators:auth

# Create emulator-data directory if it doesn't exist
if (-not (Test-Path "./emulator-data")) {
    New-Item -ItemType Directory -Path "./emulator-data"
}

# Start Firebase emulators in a new PowerShell window
Write-Host "Starting Firebase emulators..."
Start-Process powershell -ArgumentList "-Command firebase emulators:start --only auth,firestore,functions,storage --import=./emulator-data --export-on-exit"

# Wait for emulators to start
Write-Host "Waiting for emulators to start..."
Start-Sleep -Seconds 10

# Run seed scripts
Write-Host "Seeding users..."
npm run seed:users

Write-Host "Seeding data..."
npm run seed:data

Write-Host "Setup complete! Firebase emulators are running with seeded data."
Write-Host "Close the emulator window when you're done." 