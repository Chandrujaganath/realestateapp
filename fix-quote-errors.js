#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to find all TypeScript and JavaScript files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (file === 'node_modules' || file === '.next') {
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (/\.(tsx?|jsx?)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Special case fixes for problematic files
const specialCaseFixes = {
  'app/manager/leave/page.tsx': {
    find: /You haven't submitted any leave requests yet\./g,
    replace: "You haven't submitted any leave requests yet.",
  },
  'app/manager/sell-requests/page.tsx': {
    find: /You haven't received any sale requests yet\./g,
    replace: "You haven't received any sale requests yet.",
  },
  'app/client/visit-bookings/page.tsx': {
    find: /\\"You haven't booked any property visits yet\."/g,
    replace: '"You haven\'t booked any property visits yet."',
  },
  'app/admin/managers/page.tsx': {
    find: /\\"You haven't added any managers yet\."/g,
    replace: '"You haven\'t added any managers yet."',
  },
  'components/guest/schedule-visit-button.tsx': {
    find: /\\"We'll contact you to confirm your visit\."/g,
    replace: '"We\'ll contact you to confirm your visit."',
  },
};

// Function to fix escaped quotes in a file
function fixEscapedQuotes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;

    // Check if this is a special case file
    if (specialCaseFixes[filePath]) {
      const { find, replace } = specialCaseFixes[filePath];
      fixedContent = content.replace(find, replace);
    } else {
      // Fix escaped single quotes
      fixedContent = fixedContent.replace(/\'/g, "'");

      // Fix double quotes in attributes
      fixedContent = fixedContent.replace(/className=\\"/g, 'className="');
      fixedContent = fixedContent.replace(/variant=\\"/g, 'variant="');
      fixedContent = fixedContent.replace(/label=\\"/g, 'label="');

      // Fix escaped quotes in text strings
      fixedContent = fixedContent.replace(/\\"([^"]*?)\\"/g, '"$1"');

      // Fix text content with escaped quotes
      fixedContent = fixedContent.replace(/ \"([^"]*?)"/g, ' "$1"');

      // Fix more patterns of escaped quotes
      fixedContent = fixedContent.replace(/=\\"/g, '="');
      fixedContent = fixedContent.replace(/\">/g, '">');
    }

    // Only write if changes were made
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Finding files to process...');
  const files = findFiles('.');
  console.log(`Found ${files.length} files to process`);

  let fixedCount = 0;

  // Process each file
  files.forEach((file) => {
    const wasFixed = fixEscapedQuotes(file);
    if (wasFixed) {
      fixedCount++;
    }
  });

  console.log(`Fixed ${fixedCount} files`);

  // Only run Prettier if files were fixed
  if (fixedCount > 0) {
    console.log('Now running Prettier to fix formatting...');
    try {
      exec('npx prettier --write "**/*.{js,jsx,ts,tsx}"', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error running Prettier:', error);
          return;
        }
        console.log(stdout);
        console.log('✅ Formatting complete!');
      });
    } catch (error) {
      console.error('❌ Error running Prettier:', error.message);
    }
  }
}

main().catch(console.error);
