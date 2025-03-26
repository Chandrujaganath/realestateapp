const fs = require('fs');
const path = require('path');

// Function to recursively process all files in a directory
function processDirectory(directory) {
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory() && item !== 'node_modules' && item !== '.next') {
      processDirectory(itemPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      updateImports(itemPath);
    }
  }
}

// Function to update imports in a file
function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace the import
    content = content.replace(
      /import\s+\{\s*useAuth\s*\}\s+from\s+['"]@\/context\/auth-context['"]/g,
      `import { useAuth } from '@/hooks/use-auth'`
    );

    // Write back only if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Start processing from the current directory
const rootDir = process.cwd();
processDirectory(rootDir);

console.log('Import updates completed successfully!');
