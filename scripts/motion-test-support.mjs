import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

/** Runs the real controller with explicitly supplied browser doubles. */
export function loadMotion(file, globals = {}, cache = new Map()) {
  const resolved = path.resolve(file);
  if (cache.has(resolved)) return cache.get(resolved);
  const exports = {};
  cache.set(resolved, exports);
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, ...globals, require(id) {
    if (!id.startsWith('./') && !id.startsWith('../')) throw Error(`Unexpected dependency: ${id}`);
    return loadMotion(path.resolve(path.dirname(resolved), `${id}.ts`), globals, cache);
  } }, { timeout: 1000 });
  return exports;
}

export const { motionTokens } = loadMotion('src/lib/motion/tokens.ts');
export function motionDependencies(media) {
  const preferences = {
    prefersReducedMotion: () => media.matches,
    subscribeMotion(listener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    },
  };
  return { '@/lib/motion/preferences': preferences, './motion/preferences': preferences, '@/lib/motion/tokens': { motionTokens } };
}
