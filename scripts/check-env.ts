/**
 * Environment variables validation script
 * Run with: npx ts-node scripts/check-env.ts
 */

// Define required environment variables by category
const requiredVars = {
  firebase: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  nextAuth: [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ],
};

// Function to check if an environment variable is defined
function isVarDefined(varName: string): boolean {
  return typeof process.env[varName] !== 'undefined' && 
         process.env[varName] !== null && 
         process.env[varName] !== '';
}

// Check for missing variables in each category
function checkCategory(category: string, vars: string[]): { valid: boolean; missing: string[] } {
  const missing = vars.filter(varName => !isVarDefined(varName));
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Main function to run the checks
function checkEnvironmentVariables(): void {
  console.log('🔍 Checking environment variables...');
  
  let hasErrors = false;
  
  // Check each category
  for (const [category, vars] of Object.entries(requiredVars)) {
    const result = checkCategory(category, vars);
    
    if (result.valid) {
      console.log(`✅ ${category}: All required variables are defined`);
    } else {
      hasErrors = true;
      console.error(`❌ ${category}: Missing required variables: ${result.missing.join(', ')}`);
    }
  }
  
  // Display summary
  if (hasErrors) {
    console.error('⚠️ Environment validation failed. Please check the missing variables.');
    
    // Exit with error in CI/CD environments
    if (process.env.CI === 'true') {
      process.exit(1);
    }
  } else {
    console.log('✅ All required environment variables are present!');
  }
}

// Run the check
checkEnvironmentVariables(); 