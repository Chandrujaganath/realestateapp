const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function processFile(filePath) {
  try {
    // Run eslint on the file to check for 'React is not defined' errors
    const output = execSync(`npx eslint ${filePath} --format json`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const lintResults = JSON.parse(output);

    // Check if the file has 'React is not defined' errors
    const hasReactErrors = lintResults.some((result) =>
      result.messages.some((msg) => msg.message === "'React' is not defined")
    );

    if (hasReactErrors) {
      console.log(`Fixing React import in: ${filePath}`);
      const content = await readFileAsync(filePath, 'utf8');

      // Check if there's already a React import
      if (!content.includes('import React') && !content.includes('import * as React')) {
        // Add React import after 'use client' if it exists, otherwise at the beginning
        let updatedContent;
        if (content.includes("'use client'")) {
          updatedContent = content.replace(
            "'use client'",
            "'use client';\n\nimport React from 'react'"
          );
        } else {
          updatedContent = `import React from 'react';\n\n${content}`;
        }

        await writeFileAsync(filePath, updatedContent, 'utf8');
        return true;
      }
    }

    return false;
  } catch (error) {
    // Skip files that cause errors in lint
    return false;
  }
}

async function main() {
  try {
    // Get list of files with 'React is not defined' errors
    const output = execSync('npx eslint --ext .ts,.tsx . --format json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const lintResults = JSON.parse(output);

    const filesToFix = lintResults
      .filter((result) => result.messages.some((msg) => msg.message === "'React' is not defined"))
      .map((result) => result.filePath);

    console.log(`Found ${filesToFix.length} files with React definition errors`);

    let fixedFiles = 0;
    for (const file of filesToFix) {
      if (await processFile(file)) {
        fixedFiles++;
      }
    }

    console.log(`Fixed React imports in ${fixedFiles} files`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
