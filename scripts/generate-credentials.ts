import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// User roles
const _roles = ['guest', 'client', 'manager', 'admin', 'superadmin'];

// Generate credentials
function generateCredentials() {
  const credentials = [];

  for (const role of _roles) {
    for (let i = 1; i <= 5; i++) {
      const email = `${role}${i}@realestate-app.com`;
      const password = `${role}${i}Pass123!`;

      credentials.push({
        role,
        email,
        password,
      });
    }
  }

  return credentials;
}

// Save credentials to file
function saveCredentials(credentials: any[]) {
  const filePath = path.join(process.cwd(), 'credentials.json');

  // Encrypt credentials
  const _algorithm = 'aes-256-ctr';
  const secretKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const _encrypt = (_text: string) => {
    const cipher = crypto.createCipheriv(_algorithm, secretKey, iv);
    const _encrypted = Buffer.concat([cipher.update(_text), cipher.final()]);
    return {
      iv: iv.toString('hex'),
      content: _encrypted.toString('hex'),
    };
  };

  const _encryptedData = _encrypt(JSON.stringify(credentials));

  // Save encryption key separately
  fs.writeFileSync(
    path.join(process.cwd(), 'encryption-key.json'),
    JSON.stringify({
      key: secretKey.toString('hex'),
      iv: iv.toString('hex'),
    })
  );

  // Save encrypted credentials
  fs.writeFileSync(filePath, JSON.stringify(_encryptedData));

  console.log(`Credentials saved to ${filePath}`);
  console.log('Encryption key saved to encryption-key.json');
  console.log('IMPORTANT: Keep encryption-key.json secure and do not commit to version control!');

  // Also save plain text for immediate use
  fs.writeFileSync(
    path.join(process.cwd(), 'credentials-plain.json'),
    JSON.stringify(credentials, null, 2)
  );

  console.log('Plain text credentials saved to credentials-plain.json for immediate use');
  console.log('IMPORTANT: Delete credentials-plain.json after use!');

  return credentials;
}

// Run the script
const credentials = generateCredentials();
saveCredentials(credentials);

// Display credentials in console
console.table(credentials);
