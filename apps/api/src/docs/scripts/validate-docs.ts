import fs from 'node:fs';
import path from 'node:path';
import { openApiSpec } from '../openapi';

function validateOpenApiSpec() {
  console.log('🔍 Validating SprintHub OpenAPI 3.0 Specification...\n');

  // 1. Basic Structure
  if (!openApiSpec.openapi || !openApiSpec.openapi.startsWith('3.')) {
    throw new Error(`Invalid OpenAPI version: expected 3.x, found ${openApiSpec.openapi}`);
  }

  if (!openApiSpec.info || !openApiSpec.info.title || !openApiSpec.info.version) {
    throw new Error('Missing info section (title or version)');
  }

  const paths = openApiSpec.paths as Record<string, Record<string, any>>;
  const schemas = openApiSpec.components.schemas as Record<string, any>;

  const pathKeys = Object.keys(paths);
  const schemaKeys = Object.keys(schemas);

  if (pathKeys.length === 0) {
    throw new Error('OpenAPI specification has no paths defined');
  }

  if (schemaKeys.length === 0) {
    throw new Error('OpenAPI specification has no component schemas defined');
  }

  let operationCount = 0;
  const declaredTags = new Set(openApiSpec.tags.map((t) => t.name));
  const usedTags = new Set<string>();
  const referencedSchemas = new Set<string>();

  // Helper to extract schema references recursively
  function scanRefs(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.$ref && typeof obj.$ref === 'string') {
      const match = obj.$ref.match(/^#\/components\/schemas\/(.+)$/);
      if (match) {
        referencedSchemas.add(match[1]);
        if (!schemas[match[1]]) {
          throw new Error(`Unresolved schema reference: "${obj.$ref}"`);
        }
      }
    }
    for (const key of Object.keys(obj)) {
      scanRefs(obj[key]);
    }
  }

  // Scan schemas for nested refs
  for (const [name, schema] of Object.entries(schemas)) {
    scanRefs(schema);
  }

  // 2. Validate Paths & Operations
  for (const pathKey of pathKeys) {
    if (!pathKey.startsWith('/api/')) {
      throw new Error(`Invalid route path "${pathKey}". All routes must begin with /api/`);
    }

    const pathItem = paths[pathKey];
    const allowedMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!allowedMethods.includes(method.toLowerCase())) {
        throw new Error(`Unknown HTTP method "${method}" in path "${pathKey}"`);
      }

      operationCount++;

      if (!operation.summary) {
        throw new Error(`Missing summary for ${method.toUpperCase()} ${pathKey}`);
      }

      if (!operation.responses || Object.keys(operation.responses).length === 0) {
        throw new Error(`Missing responses for ${method.toUpperCase()} ${pathKey}`);
      }

      if (Array.isArray(operation.tags)) {
        operation.tags.forEach((tag: string) => {
          usedTags.add(tag);
          if (!declaredTags.has(tag)) {
            console.warn(
              `⚠️ Warning: Tag "${tag}" in ${method.toUpperCase()} ${pathKey} is not declared in top-level tags`
            );
          }
        });
      }

      scanRefs(operation);
    }
  }

  // 3. Export JSON Artifact
  const outputDir = path.resolve(process.cwd(), 'dist/docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2), 'utf-8');

  console.log('✅ OpenAPI 3.0 Specification is 100% valid!');
  console.log(`   - Title: ${openApiSpec.info.title} (v${openApiSpec.info.version})`);
  console.log(`   - Total Endpoints (Paths): ${pathKeys.length}`);
  console.log(`   - Total Operations: ${operationCount}`);
  console.log(`   - Total Component Schemas: ${schemaKeys.length}`);
  console.log(`   - Schemas Referenced: ${referencedSchemas.size}`);
  console.log(`   - Top-level Tags: ${declaredTags.size}`);
  console.log(`   - Output Artifact: ${outputPath}\n`);
}

try {
  validateOpenApiSpec();
} catch (error: any) {
  console.error('❌ OpenAPI Validation Failed:', error.message);
  process.exit(1);
}
