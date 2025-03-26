const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@typescript-eslint/parser');
const prettier = require('prettier');

// Find all TypeScript and TSX files
function findFiles() {
  return glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'functions/node_modules/**',
      'functions/lib/**',
      'functions/dist/**',
      'public/**',
      'build/**',
    ],
  });
}

async function fixJsxQuotes() {
  const files = findFiles();
  let modifiedFiles = 0;
  const errors = [];

  // Get prettier config
  const prettierConfig = await prettier.resolveConfig(process.cwd());

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');

      // Use prettier to format with single quotes
      const formatted = await prettier.format(content, {
        ...prettierConfig,
        filepath: file,
        singleQuote: true,
        jsxSingleQuote: true,
      });

      if (content !== formatted) {
        fs.writeFileSync(file, formatted, 'utf-8');
        modifiedFiles++;
        console.log(`Fixed quotes in: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
      errors.push({ file, error: error.message });
    }
  }

  console.log(`\nSummary:`);
  console.log(`Modified files: ${modifiedFiles}`);
  if (errors.length > 0) {
    console.log(`Errors: ${errors.length}`);
    console.log('Error details:');
    errors.forEach(({ file, error }) => {
      console.log(`  ${file}: ${error}`);
    });
  }
}

// Run the fix
fixJsxQuotes().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
