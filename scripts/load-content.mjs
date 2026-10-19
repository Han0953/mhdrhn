import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

/** Executes local typed content for invariants without installing a test runner. */
export function loadContent(file = 'src/lib/content.ts', cache = new Map()) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  cache.set(absolute, exports);
  vm.runInNewContext(code, { exports, require(specifier) {
    if (!specifier.startsWith('./')) throw new Error(`Unexpected content dependency: ${specifier}`);
    return loadContent(path.resolve(path.dirname(absolute), `${specifier}.ts`), cache);
  } }, { timeout: 1000 });
  return exports;
}
