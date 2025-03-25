#!/bin/bash

# Set environment variable to use emulators
export NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true

# Run the seed script
npx ts-node scripts/seed-users.ts

