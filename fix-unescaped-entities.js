const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to replace unescaped quotes in JSX
function fixUnescapedEntities(content) {
  // Fix single quotes that aren't already escaped
  // Avoid replacing quotes in import statements, JSX attribute values with double quotes, and comments
  let fixed = content.replace(/(\{.*?)(?<![\\&])'(?!.*?\})/g, "$1'");

  // Fix inside JSX text content (between > and <)
  fixed = fixed.replace(/(?<=>)([^<]*?)(?<![\\&])'(?=[^>]*?<)/g, "$1'");

  // Fix double quotes
  fixed = fixed.replace(/(\{.*?)(?<![\\&])"(?!.*?\})/g, '$1\"');

  // Fix inside JSX text content (between > and <)
  fixed = fixed.replace(/(?<=>)([^<]*?)(?<![\\&])"(?=[^>]*?<)/g, '$1\"');

  return fixed;
}

// Find all TSX files
const files = glob.sync('./app/**/*.tsx').concat(glob.sync('./components/**/*.tsx'));

console.log(`Found ${files.length} files to process`);

let fixedCount = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const fixed = fixUnescapedEntities(content);

  if (content !== fixed) {
    fs.writeFileSync(file, fixed, 'utf8');
    console.log(`Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files`);
