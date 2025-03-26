const fs = require('fs');
const path = require('path');

// Function to recursively get all files in a directory
function getAllFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip node_modules, .next, and other directories we don't want to process
    if (stat.isDirectory() && 
        !file.startsWith('.') && 
        file !== 'node_modules' && 
        file !== '.next' && 
        file !== 'out' && 
        file !== 'dist') {
      getAllFiles(filePath, ext, fileList);
    } else if (stat.isFile() && file.endsWith(ext)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function fixJsxAttributes() {
  let modifiedFiles = 0;
  let errors = 0;

  try {
    // Get all .tsx files
    const tsxFiles = getAllFiles('.', '.tsx');
    // Get all .jsx files
    const jsxFiles = getAllFiles('.', '.jsx');
    
    const files = [...tsxFiles, ...jsxFiles];
    console.log(`Found ${files.length} files to process`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // This regex will find JSX attributes with single quotes and convert them to double quotes
        // It looks for patterns like className='something' and converts to className="something"
        const fixedContent = content.replace(/(\w+)=('([^']*)')/g, '$1="$3"');
        
        if (content !== fixedContent) {
          fs.writeFileSync(file, fixedContent, 'utf8');
          console.log(`Fixed: ${file}`);
          modifiedFiles++;
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errors++;
      }
    }

    console.log(`\nCompleted with ${modifiedFiles} files modified and ${errors} errors`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fixJsxAttributes(); 