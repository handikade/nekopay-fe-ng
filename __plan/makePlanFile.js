const fs = require('fs');
const path = require('path');

/**
 * Converts a string to snake_case.
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2') // camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // ACRONYMPascal
    .replace(/[^a-zA-Z0-9]+/g, '_') // non-alphanumeric to _
    .toLowerCase()
    .replace(/^_+|_+$/g, ''); // trim _
}

function run() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');

  if (nameIndex === -1 || !args[nameIndex + 1]) {
    console.error('Error: Missing plan name.');
    console.log('Usage: node makePlanFile.js --name "Your Plan Name"');
    process.exit(1);
  }

  // Gather all arguments after --name as the name
  const rawName = args.slice(nameIndex + 1).join(' ');
  const snakeName = toSnakeCase(rawName);
  const unixTime = Math.floor(Date.now() / 1000);
  const fileName = `${unixTime}_${snakeName}.md`;

  const planDir = path.join(process.cwd(), '__plan');
  const filePath = path.join(planDir, fileName);

  try {
    if (!fs.existsSync(planDir)) {
      fs.mkdirSync(planDir, { recursive: true });
    }

    // Initialize with a header for convenience
    fs.writeFileSync(filePath, '# ' + rawName + '\n\n', 'utf8');
    console.log(`Plan created: ${filePath}`);
  } catch (error) {
    console.error('An error occurred while creating the plan file:');
    console.error(error.message);
    process.exit(1);
  }
}

run();
