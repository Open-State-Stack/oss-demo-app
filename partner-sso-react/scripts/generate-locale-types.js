/**
 * Generates TypeScript types from JSON translation files.
 *
 * This script reads translation JSON files from `public/locales/en` and
 * generates a `TranslationsTypes` interface representing the structure of those files.
 * It also includes utility types for working with nested keys in translation objects.
 * The output is saved to `src/types/translations/index.ts`.
 *
 * Usage: Run this script with Node.js to update translation types whenever the translation files change.
 */

const fs = require('fs');
const path = require('path');

function generateTypes() {
  console.info('🚀 Generating translation types...');
  const localesPath = path.join(process.cwd(), 'public/locales/en');
  //src/types
  const outputPath = path.join(process.cwd(), 'src/types/translations');

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Read all JSON files from the English locale directory
  const files = fs.readdirSync(localesPath).filter(f => f.endsWith('.json'));

  // Generate the interface content
  let interfaceContent = 'export interface TranslationsTypes {\n';

  files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(localesPath, file), 'utf8'));
    const typeName = file.replace('.json', '');
    interfaceContent += `  ${typeName}: ${JSON.stringify(content, null, 2)};\n`;
  });

  interfaceContent += '}\n\n';

  // Add utility types for nested keys
  interfaceContent += `
type NestedKeyOfHelper<T> = T extends object
  ? { [K in keyof T]: K extends string ? T[K] extends Record<string, any>
    ? K | \`\${K}.\${NestedKeyOfHelper<T[K]>}\`
    : K
    : never
  }[keyof T]
  : never;

export type NestedKeyOf<T extends object> = NestedKeyOfHelper<T>;

export type TranslationKey<T extends keyof TranslationsTypes> = NestedKeyOf<TranslationsTypes[T]>;
`;

  fs.writeFileSync(
    path.join(outputPath, 'index.ts'),
    interfaceContent
  );

  console.info('✅ Translation types generated successfully!');
}

// Execute the function
generateTypes();

module.exports = generateTypes;
