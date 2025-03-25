#!/bin/bash

# Deploy Firebase Functions
echo "Deploying Firebase Functions..."
cd functions && npm run deploy

# Build the app
echo "Building the app..."
npm run build

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment complete!"

