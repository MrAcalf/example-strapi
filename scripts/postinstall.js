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

// Find better-sqlite3
const findBetterSqlite3 = () => {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  const possiblePaths = [
    path.join(nodeModulesPath, 'better-sqlite3'),
    path.join(nodeModulesPath, '.pnpm', 'better-sqlite3@8.6.0', 'node_modules', 'better-sqlite3'),
  ];

  for (const sqlitePath of possiblePaths) {
    if (fs.existsSync(sqlitePath)) {
      return sqlitePath;
    }
  }

  const searchInDir = (dir, depth = 0) => {
    if (depth > 3) return null;
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name === 'better-sqlite3') {
          const sqlitePath = path.join(dir, entry.name);
          if (fs.existsSync(path.join(sqlitePath, 'package.json'))) {
            return sqlitePath;
          }
        }
        if (entry.isDirectory() && entry.name.startsWith('better-sqlite3@')) {
          const sqlitePath = path.join(dir, entry.name, 'node_modules', 'better-sqlite3');
          if (fs.existsSync(sqlitePath)) {
            return sqlitePath;
          }
        }
      }
    } catch (err) {
      // Ignore errors
    }
  };

  return searchInDir(nodeModulesPath);
};

// Check if better-sqlite3 binary exists
const sqliteBinaryExists = (sqlitePath) => {
  const binaryPath = path.join(sqlitePath, 'build', 'Release', 'better_sqlite3.node');
  if (fs.existsSync(binaryPath)) {
    return true;
  }
  
  const buildPath = path.join(sqlitePath, 'build');
  if (fs.existsSync(buildPath)) {
    try {
      const buildEntries = fs.readdirSync(buildPath, { recursive: true });
      return buildEntries.some(entry => entry.includes('better_sqlite3') && entry.endsWith('.node'));
    } catch (err) {
      // Ignore
    }
  }
  
  return false;
};

// Build better-sqlite3
const buildBetterSqlite3 = (sqlitePath) => {
  try {
    console.log(`📦 Building better-sqlite3 at ${sqlitePath}`);
    
    if (fs.existsSync(path.join(sqlitePath, 'package.json'))) {
      execSync('npm run install', {
        cwd: sqlitePath,
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ better-sqlite3 built successfully');
      return true;
    }
  } catch (error) {
    console.warn('⚠️  Could not build better-sqlite3 automatically:', error.message);
    return false;
  }
};

// Main execution
try {
  // Build sharp
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

  // Build better-sqlite3
  const sqlitePath = findBetterSqlite3();
  
  if (sqlitePath) {
    if (sqliteBinaryExists(sqlitePath)) {
      console.log('✅ better-sqlite3 binary already exists, skipping build');
    } else {
      buildBetterSqlite3(sqlitePath);
    }
  } else {
    console.log('⚠️  better-sqlite3 not found in node_modules, skipping build');
  }
} catch (error) {
  console.warn('⚠️  Postinstall script warning:', error.message);
  // Don't fail the build if postinstall fails
}

console.log('✅ Postinstall script completed');
