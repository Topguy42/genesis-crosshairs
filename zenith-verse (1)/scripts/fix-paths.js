#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const indexPath = join(process.cwd(), 'dist/spa/index.html');

try {
  let content = readFileSync(indexPath, 'utf8');
  
  // Replace absolute asset paths with relative paths for Electron
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  
  writeFileSync(indexPath, content);
  console.log('✅ Fixed asset paths for Electron compatibility');
} catch (error) {
  console.error('❌ Error fixing asset paths:', error.message);
  process.exit(1);
}
