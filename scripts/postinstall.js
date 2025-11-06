#!/usr/bin/env node

/**
 * Postinstall script to ensure native modules are built
 * This is necessary for Koyeb/Heroku buildpacks that may block install scripts
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Running postinstall script...');

// Find sharp directory
const findSharp = () => {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  // Check common locations
  const possiblePaths = [
    path.join(nodeModulesPath, 'sharp'),
    path.join(nodeModulesPath, '.pnpm', 'sharp@0.32.6', 'node_modules', 'sharp'),
  ];

  for (const sharpPath of possiblePaths) {
    if (fs.existsSync(sharpPath)) {
      return sharpPath;
    }
  }

  // Recursive search (limited depth)
  const searchInDir = (dir, depth = 0) => {
    if (depth > 3) return null; // Limit depth
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name === 'sharp') {
          const sharpPath = path.join(dir, entry.name);
          if (fs.existsSync(path.join(sharpPath, 'package.json'))) {
            return sharpPath;
          }
        }
        if (entry.isDirectory() && entry.name.startsWith('sharp@')) {
          const sharpPath = path.join(dir, entry.name, 'node_modules', 'sharp');
          if (fs.existsSync(sharpPath)) {
            return sharpPath;
          }
        }
      }
    } catch (err) {
      // Ignore errors
    }
  };

  return searchInDir(nodeModulesPath);
};

// Check if binary exists
const binaryExists = (sharpPath) => {
  const binaryPath = path.join(sharpPath, 'build', 'Release', 'sharp-linux-x64.node');
  if (fs.existsSync(binaryPath)) {
    return true;
  }
  
  // Check alternative locations
  const libPath = path.join(sharpPath, 'lib');
  if (fs.existsSync(libPath)) {
    try {
      const libEntries = fs.readdirSync(libPath);
      return libEntries.some(entry => entry.includes('sharp') && entry.endsWith('.node'));
    } catch (err) {
      // Ignore
    }
  }
  
  return false;
};

// Build sharp
const buildSharp = (sharpPath) => {
  try {
    console.log(`📦 Building sharp at ${sharpPath}`);
    
    if (fs.existsSync(path.join(sharpPath, 'package.json'))) {
      execSync('npm run install', {
        cwd: sharpPath,
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ sharp built successfully');
      return true;
    }
  } catch (error) {
    console.warn('⚠️  Could not build sharp automatically:', error.message);
    return false;
  }
};

// Main execution
try {
  const sharpPath = findSharp();
  
  if (sharpPath) {
    if (binaryExists(sharpPath)) {
      console.log('✅ sharp binary already exists, skipping build');
    } else {
      buildSharp(sharpPath);
    }
  } else {
    console.log('⚠️  sharp not found in node_modules, skipping build');
  }
} catch (error) {
  console.warn('⚠️  Postinstall script warning:', error.message);
  // Don't fail the build if postinstall fails
}

console.log('✅ Postinstall script completed');
