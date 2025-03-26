#!/usr/bin/env node

/**
 * A script to automatically fix Prettier formatting issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run prettier fix on all files
function fixPrettierIssues() {
  try {
    console.log('🔄 Running Prettier to fix formatting issues...');

    // Run Prettier to fix all files
    execSync('npx prettier --write "**/*.{js,jsx,ts,tsx}"', {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    console.log('✅ Prettier formatting issues fixed!');

    // Run lint to check if other issues remain
    console.log('\n🔍 Checking for remaining linting issues...');
    try {
      execSync('npm run lint', {
        stdio: 'inherit',
        encoding: 'utf-8',
      });
      console.log('✅ No remaining linting issues!');
    } catch (error) {
      console.log('⚠️ Some linting issues still remain (non-Prettier issues).');
    }
  } catch (error) {
    console.error('❌ Error running Prettier fix:', error.message);
    process.exit(1);
  }
}

// Run the function
fixPrettierIssues();
