#!/usr/bin/env node

/**
 * Generates app icons for iOS and Android from a source icon.
 *
 * Usage:
 *   1. Place a 1024x1024 PNG at resources/icon.png
 *   2. npm install sharp   (if not already installed)
 *   3. node resources/generate-icons.js
 *
 * If sharp is unavailable the script prints the required sizes so you can
 * resize manually or use an online generator like https://icon.kitchen.
 */

import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(__dirname, 'icon.png');

const ANDROID_SIZES = [
  { name: 'mdpi',    size: 48  },
  { name: 'hdpi',    size: 72  },
  { name: 'xhdpi',   size: 96  },
  { name: 'xxhdpi',  size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

const IOS_SIZES = [
  { name: '20@2x',  size: 40  },
  { name: '20@3x',  size: 60  },
  { name: '29@2x',  size: 58  },
  { name: '29@3x',  size: 87  },
  { name: '40@2x',  size: 80  },
  { name: '40@3x',  size: 120 },
  { name: '60@2x',  size: 120 },
  { name: '60@3x',  size: 180 },
  { name: '76',      size: 76  },
  { name: '76@2x',  size: 152 },
  { name: '83.5@2x', size: 167 },
  { name: '1024',    size: 1024 },
];

async function generate() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('sharp is not installed. Install it with: npm install sharp\n');
    console.log('Required icon sizes:\n');
    console.log('Android (place in android/app/src/main/res/mipmap-{density}):');
    ANDROID_SIZES.forEach(s => console.log(`  mipmap-${s.name}/ic_launcher.png  ${s.size}x${s.size}`));
    console.log('\niOS (place in ios/App/App/Assets.xcassets/AppIcon.appiconset):');
    IOS_SIZES.forEach(s => console.log(`  AppIcon-${s.name}.png  ${s.size}x${s.size}`));
    console.log('\nAlternatively use https://icon.kitchen to generate from a 1024x1024 source.');
    return;
  }

  if (!existsSync(SOURCE)) {
    console.error(`Source icon not found at ${SOURCE}`);
    console.error('Place a 1024x1024 PNG there and re-run.');
    process.exit(1);
  }

  // Android icons
  for (const { name, size } of ANDROID_SIZES) {
    const dir = join(ROOT, 'android', 'app', 'src', 'main', 'res', `mipmap-${name}`);
    mkdirSync(dir, { recursive: true });
    await sharp(SOURCE).resize(size, size).png().toFile(join(dir, 'ic_launcher.png'));
    console.log(`  Android mipmap-${name} (${size}x${size})`);
  }

  // iOS icons
  const iosDir = join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  mkdirSync(iosDir, { recursive: true });
  for (const { name, size } of IOS_SIZES) {
    await sharp(SOURCE).resize(size, size).png().toFile(join(iosDir, `AppIcon-${name}.png`));
    console.log(`  iOS AppIcon-${name} (${size}x${size})`);
  }

  console.log('\nDone! Icons generated for both platforms.');
}

generate().catch(console.error);
