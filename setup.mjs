import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runCommand = (command, options = {}) => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
};

// Install backend dependencies
console.log('Installing backend dependencies...');
runCommand('npm install');

// Navigate to the frontend directory
const frontendDir = join(__dirname, 'frontend');
process.chdir(frontendDir);

// Install frontend dependencies
console.log('Installing frontend dependencies...');
runCommand('npm install');

// Build the frontend
console.log('Building frontend...');
runCommand('npm run build');

// Navigate back to the root directory
process.chdir(__dirname);

console.log('');
console.log('Setup complete!');
console.log('To start the server, use command: npm run start');
