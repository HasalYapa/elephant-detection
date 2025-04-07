const fs = require('fs');
const path = require('path');

// Function to copy a file
function copyFile(source, target) {
  const targetDir = path.dirname(target);
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy the file
  fs.copyFileSync(source, target);
  console.log(`Copied: ${source} -> ${target}`);
}

// Function to copy a directory recursively
function copyDir(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDir(sourcePath, targetPath);
    } else {
      // Copy files
      copyFile(sourcePath, targetPath);
    }
  }
}

// Main function
function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const outDir = path.join(__dirname, '..', 'out');
  
  console.log('Copying public files to out directory...');
  
  // Check if public directory exists
  if (!fs.existsSync(publicDir)) {
    console.error('Public directory not found!');
    process.exit(1);
  }
  
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    console.error('Out directory not found!');
    process.exit(1);
  }
  
  // Copy public directory to out directory
  copyDir(publicDir, outDir);
  
  console.log('Done!');
}

// Run the main function
main();
