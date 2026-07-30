const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRISMA_DIR = __dirname;
const ENUMS_DIR = path.join(PRISMA_DIR, 'enum');
const MODELS_DIR = path.join(PRISMA_DIR, 'models');
const OUTPUT_FILE = path.join(PRISMA_DIR, 'schema.prisma');

const baseSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
`;

function getFilesContent(dir) {
  if (!fs.existsSync(dir)) return '';
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.prisma'))
    .map(file => {
      const filePath = path.join(dir, file);
      const filename = path.basename(file, '.prisma');
      const content = fs.readFileSync(filePath, 'utf-8');
      return `\n// ==========================================\n// From ${dir === ENUMS_DIR ? 'Enum' : 'Model'}: ${filename}\n// ==========================================\n\n${content}`;
    })
    .join('\n');
}

try {
  console.log('Merging Prisma schema files...');
  let schema = baseSchema;
  
  // Read enums
  schema += '\n' + getFilesContent(ENUMS_DIR);
  
  // Read models
  schema += '\n' + getFilesContent(MODELS_DIR);
  
  fs.writeFileSync(OUTPUT_FILE, schema, 'utf-8');
  console.log(`Schema successfully written to ${OUTPUT_FILE}`);
  
  // Try formatting the file
  try {
    console.log('Formatting schema.prisma...');
    execSync('npx prisma format', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (fmtError) {
    console.warn('Could not run npx prisma format automatically. You can format it manually. Error:', fmtError.message);
  }
} catch (error) {
  console.error('Error merging schema:', error.message);
  process.exit(1);
}
