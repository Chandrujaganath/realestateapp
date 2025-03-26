#!/usr/bin/env node

/**
 * A script to automatically fix unused variables by prefixing them with an underscore
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@typescript-eslint/parser');
const prettier = require('prettier');

// Regular expression to match unused variable warnings from ESLint
const UNUSED_VAR_REGEX =
  /'([^']+)' is (assigned a value but never used|defined but never used)\. Allowed unused (vars|args) must match/g;

// Function to find all TypeScript and JavaScript files
const findFiles = () => {
  const tsFiles = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'fix-*.js', '*.d.ts'],
  });
  return tsFiles;
};

// Function to fix unused variables by adding underscore prefix
async function fixUnusedVars(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse the file to get AST
    const ast = parser.parse(content, {
      sourceType: 'module',
      ecmaVersion: 2020,
      ecmaFeatures: {
        jsx: true,
      },
      range: true,
      loc: true,
    });

    // Track modified content
    let modifiedContent = content;
    const modifications = [];

    // Find unused variables
    const unusedVars = findUnusedVariables(ast);

    // Apply modifications from end to start to avoid offset issues
    if (unusedVars.length > 0) {
      // Sort by position (descending) to avoid offset issues when making multiple changes
      unusedVars.sort((a, b) => b.range[0] - a.range[0]);

      // Apply changes
      for (const { name, range } of unusedVars) {
        // Skip if variable already starts with underscore
        if (name.startsWith('_')) continue;

        // Add underscore prefix
        const start = range[0];
        modifiedContent =
          modifiedContent.substring(0, start) + '_' + modifiedContent.substring(start);

        modifications.push(name);
      }

      // Format with prettier if we made changes
      if (modifications.length > 0) {
        try {
          const prettierConfig = await prettier.resolveConfig(filePath);
          modifiedContent = await prettier.format(modifiedContent, {
            ...prettierConfig,
            filepath: filePath,
          });
        } catch (formatError) {
          console.error(`Error formatting ${filePath}:`, formatError.message);
          // Continue with unformatted changes if prettier fails
        }

        // Write changes back to file
        fs.writeFileSync(filePath, modifiedContent, 'utf-8');
        return {
          filePath,
          modified: true,
          variables: modifications,
        };
      }
    }

    return { filePath, modified: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { filePath, modified: false, error: error.message };
  }
}

// Function to identify unused variables in AST
function findUnusedVariables(ast) {
  const unusedVars = [];

  // Simple visitor pattern for AST traversal
  function visit(node, parent) {
    if (!node || typeof node !== 'object') return;

    // Check for variable declarations
    if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
      // Check if the variable is referenced elsewhere - this is a simplified approach
      // In a complete implementation, you'd track variable references throughout the AST
      if (isLikelyUnused(node.id.name, ast)) {
        unusedVars.push({
          name: node.id.name,
          range: node.id.range,
        });
      }
    }

    // Check function parameters
    if (
      (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') &&
      node.params &&
      Array.isArray(node.params)
    ) {
      node.params.forEach((param) => {
        if (param.type === 'Identifier' && isLikelyUnused(param.name, ast)) {
          unusedVars.push({
            name: param.name,
            range: param.range,
          });
        }
      });
    }

    // Check imports
    if (node.type === 'ImportSpecifier' && node.local && node.local.name) {
      if (isLikelyUnused(node.local.name, ast)) {
        unusedVars.push({
          name: node.local.name,
          range: node.local.range,
        });
      }
    }

    // Recursively visit children
    Object.keys(node).forEach((key) => {
      if (key !== 'parent' && typeof node[key] === 'object' && node[key] !== null) {
        if (Array.isArray(node[key])) {
          node[key].forEach((child) => visit(child, node));
        } else {
          visit(node[key], node);
        }
      }
    });
  }

  // Start traversal
  visit(ast, null);
  return unusedVars;
}

// Simple heuristic to detect unused variables
// This is a simplified approach - a real implementation would be more comprehensive
function isLikelyUnused(name, ast) {
  // Skip common patterns that are false positives
  if (name === 'React' || name === 'PropTypes' || name === 'Fragment') {
    return false;
  }

  // Skip React component names (they start with uppercase)
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return false;
  }

  // Count references to the name in the AST source
  const source = JSON.stringify(ast);
  const matches = source.match(new RegExp(`"name":"${name}"`, 'g')) || [];

  // If name appears more than 2 times, it's likely used somewhere
  return matches.length <= 2;
}

// Main function
async function main() {
  try {
    console.log('🔍 Analyzing codebase for unused variables...');
    const files = findFiles();

    let modifiedCount = 0;
    let errorCount = 0;
    const modifiedFiles = [];

    for (const file of files) {
      const result = await fixUnusedVars(file);

      if (result.error) {
        errorCount++;
        console.error(`❌ Error in ${file}: ${result.error}`);
      } else if (result.modified) {
        modifiedCount++;
        modifiedFiles.push({
          file: result.filePath,
          variables: result.variables,
        });
        console.log(`✅ Fixed ${result.variables.length} unused variables in ${result.filePath}`);
      }
    }

    if (modifiedCount > 0) {
      console.log(`\n✅ Fixed unused variables in ${modifiedCount} files.`);
      // Detailed report of changes
      modifiedFiles.forEach((item) => {
        console.log(`\n📄 ${item.file}:`);
        console.log(`   Variables prefixed: ${item.variables.join(', ')}`);
      });
    } else {
      console.log('\n✅ No unused variables found!');
    }

    if (errorCount > 0) {
      console.log(`\n⚠️ Encountered errors in ${errorCount} files.`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
