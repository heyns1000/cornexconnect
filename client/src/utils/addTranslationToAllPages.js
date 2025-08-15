// This script adds translation system to all pages automatically
const fs = require('fs');
const path = require('path');

const pagesDir = 'client/src/pages';
const hookImport = 'import { useCountry } from "@/hooks/useCountryContext";';
const hookUsage = 'const { translations: t } = useCountry();';

// Get all page files
const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.tsx'));

pageFiles.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has the hook
  if (content.includes('useCountry')) {
    console.log(`${file} already has translation hook`);
    return;
  }
  
  // Add import at the end of imports section
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  
  if (lastImportIndex !== -1) {
    content = content.slice(0, endOfLastImport + 1) + hookImport + '\n' + content.slice(endOfLastImport + 1);
  }
  
  // Add hook usage after first hook in component
  const useHookPattern = /const \{ [^}]+ \} = use[A-Z][a-zA-Z]*\([^)]*\);/;
  const match = content.match(useHookPattern);
  
  if (match) {
    const insertIndex = content.indexOf(match[0]) + match[0].length;
    content = content.slice(0, insertIndex) + '\n  ' + hookUsage + content.slice(insertIndex);
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log('Translation system added to all pages!');