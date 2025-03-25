#!/bin/bash

# Make sure Firebase emulators are installed
echo "Installing Firebase emulators..."
firebase setup:emulators:firestore
firebase setup:emulators:auth

# Start Firebase emulators in the background
echo "Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,functions,storage --import=./emulator-data --export-on-exit &
EMULATOR_PID=$!

# Wait for emulators to start
echo "Waiting for emulators to start..."
sleep 10

# Run seed scripts
echo "Seeding users..."
npm run seed:users

echo "Seeding data..."
npm run seed:data

# Keep emulators running, kill with Ctrl+C
echo "Setup complete! Firebase emulators are running with seeded data."
echo "Press Ctrl+C to stop emulators."

# Wait for user to press Ctrl+C
wait $EMULATOR_PID 