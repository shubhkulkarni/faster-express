import { Application } from 'express';
import fs from 'fs';
import path from 'path';

export function registerResources(app: Application): void {
  const resourcesPath = path.join(__dirname, '../resources');
  
  if (!fs.existsSync(resourcesPath)) {
    console.warn('Resources directory not found');
    return;
  }

  const resourceDirs = fs.readdirSync(resourcesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const resourceName of resourceDirs) {
    try {
      const resourceIndex = require(path.join(resourcesPath, resourceName, 'index'));
      if (resourceIndex.default && typeof resourceIndex.default === 'function') {
        resourceIndex.default(app);
        console.log(`✅ Registered ${resourceName} resource`);
      } else {
        console.warn(`⚠️  ${resourceName} resource does not export a default function`);
      }
    } catch (error) {
      console.error(`❌ Failed to register ${resourceName} resource:`, error);
    }
  }
}