// One-off replacement for `payload generate:importmap`, which is broken on this
// Next.js/Node combo (payload/dist/bin/loadEnv.js's `import nextEnvImport from
// '@next/env'` resolves to undefined under tsx's CJS/ESM interop on Node 25).
// This replicates exactly what payload/dist/bin/index.js does for that command,
// minus the broken loadEnv() call.
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const generateImportMapPath = path.resolve(
  process.cwd(),
  'node_modules/payload/dist/bin/generateImportMap/index.js',
)
const { generateImportMap } = await import(pathToFileURL(generateImportMapPath).toString())

const configPath = path.resolve(process.cwd(), 'payload.config.ts')
let config = await import(pathToFileURL(configPath).toString())
if (config.default) config = await config.default

await generateImportMap(config)
