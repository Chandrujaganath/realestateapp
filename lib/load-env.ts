/**
 * Utility to manually load environment variables from .env.local file
 * Use this if you're having issues with Next.js not loading env vars properly
 */
import fs from 'fs';
import path from 'path';

/**
 * Manually loads environment variables from .env.local file
 * @returns Object containing all variables that were loaded
 */
export function loadEnvFromFile(): Record<string, string> {
  const loaded: Record<string, string> = {};
  
  try {
    // Determine the root directory of the project
    const rootDir = process.cwd();
    const envPath = path.join(rootDir, '.env.local');
    
    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.error(`❌ .env.local file not found at ${envPath}`);
      return loaded;
    }
    
    // Read the file
    const envFile = fs.readFileSync(envPath, 'utf8');
    
    // Parse each line
    const lines = envFile.split('\n');
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || line.trim() === '') {
        continue;
      }
      
      // Parse key-value pairs
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Set environment variable if not already set
        if (!process.env[key]) {
          process.env[key] = value;
          loaded[key] = value;
        }
      }
    }
    
    console.log(`✅ Loaded ${Object.keys(loaded).length} environment variables from .env.local`);
    
    // For debugging, log which Firebase variables were loaded
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ];
    
    for (const varName of firebaseVars) {
      const exists = !!process.env[varName];
      console.log(`  ${varName}: ${exists ? '✅ Present' : '❌ Missing'}`);
    }
    
    return loaded;
  } catch (error) {
    console.error('❌ Error loading environment variables:', error);
    return loaded;
  }
}

// For use in client components, just check if the variables exist
export function checkFirebaseEnv(): boolean {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];
  
  return required.every(varName => !!process.env[varName]);
}

// If this file is run directly, load the environment variables
if (require.main === module) {
  loadEnvFromFile();
} 