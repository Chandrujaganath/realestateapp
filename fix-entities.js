const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function processFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');

    // Replace HTML entities with actual characters
    const fixedContent = content
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/&/g, '&');

    if (content !== fixedContent) {
      await writeFileAsync(filePath, fixedContent, 'utf8');
      console.log(`Fixed entities in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function processDirectory(directory) {
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    let fixedFiles = 0;

    const promises = entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and .next directories
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          fixedFiles += await processDirectory(fullPath);
        }
      } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        if (await processFile(fullPath)) {
          fixedFiles++;
        }
      }
    });

    await Promise.all(promises);
    return fixedFiles;
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    return 0;
  }
}

async function main() {
  const startTime = Date.now();
  const rootDir = '.';
  const fixedFiles = await processDirectory(rootDir);
  const endTime = Date.now();

  console.log(`Fixed entities in ${fixedFiles} files`);
  console.log(`Execution time: ${(endTime - startTime) / 1000} seconds`);
}

main();
