#!/bin/bash

# Start Firebase emulators
firebase emulators:start --import=./firebase-data --export-on-exit &

# Wait for emulators to start
sleep 5

# Set environment variable to use emulators
export NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

# Start Next.js app
npm run dev

