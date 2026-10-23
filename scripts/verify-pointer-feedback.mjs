// Authored CSS policy checks, not a physical-touch or browser-rendering test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';

const root = postcss.parse(fs.readFileSync('src/app/globals.css', 'utf8'));
const rules = []; root.walkRules(rule => rules.push(rule));
const results = [];
function check(name, run) { run(); results.push({ name, status: 'PASS' }); console.log('PASS ' + name); }
function eligible(rule, input) {
  for (let node = rule.parent; node; node = node.parent) {
    if (node.type !== 'atrule' || node.name !== 'media') continue;
    const matches = postcss.list.comma(node.params).some(branch => {
      const constraints = [...branch.matchAll(/\(\s*(hover|pointer)\s*:\s*([\w-]+)\s*\)/g)];
      return constraints.every(([, feature, value]) => input[feature] === value);
    });
    if (!matches) return false;
  }
  return true;
}
const hoverRules = rules.filter(rule => rule.selector.includes(':hover'));
assert.ok(hoverRules.length > 20, 'CSS audit must cover the existing interaction rules');
for (const input of [
  { hover: 'none', pointer: 'coarse' },
  { hover: 'none', pointer: 'fine' },
  { hover: 'hover', pointer: 'coarse' },
]) check(`latched :hover cannot paint for ${input.hover}/${input.pointer}`, () => {
  for (const rule of hoverRules) assert.equal(eligible(rule, input), false, rule.selector);
});
check('mouse retains every authored hover effect', () => {
  for (const rule of hoverRules) assert.equal(eligible(rule, { hover: 'hover', pointer: 'fine' }), true, rule.selector);
});
check('expanded theme trigger highlight is mouse-only', () => {
  const rule = rules.find(rule => rule.selector === '.theme-trigger[aria-expanded="true"]');
  assert.ok(rule); assert.equal(eligible(rule, { hover: 'none', pointer: 'coarse' }), false);
});
check('touch press feedback is restricted to active buttons and links', () => {
  const press = rules.filter(rule => rule.parent.type === 'atrule' && rule.parent.params === '(hover:none), (pointer:coarse)');
  assert.ok(press.length >= 6);
  for (const rule of press) {
    assert.ok(rule.selectors.every(selector => selector.includes(':active')));
    assert.equal(eligible(rule, { hover: 'none', pointer: 'coarse' }), true);
    assert.equal(eligible(rule, { hover: 'hover', pointer: 'fine' }), false);
  }
});
check('selected controls and current navigation retain their persistent semantic state', () => {
  for (const selector of ['.icon-button[aria-pressed="true"]', '.filters a[aria-current]']) {
    const rule = rules.find(rule => rule.selector === selector); assert.ok(rule);
    assert.equal(eligible(rule, { hover: 'none', pointer: 'coarse' }), true);
  }
  assert.ok(rules.some(rule => rule.selector.includes('.desktop-nav a:is(:focus-visible,[aria-current="page"])')));
});
check('keyboard focus remains available without hover capability', () => {
  for (const selector of [':focus-visible', '.story-card:has(:focus-visible)']) {
    const rule = rules.find(rule => rule.selector === selector); assert.ok(rule);
    assert.equal(eligible(rule, { hover: 'none', pointer: 'coarse' }), true);
  }
  assert.ok(!rules.some(rule => rule.selector.includes(':focus-within')));
});

const dir = process.env.MHDRHN_QA_POINTER_EVIDENCE || 'docs/execution/evidence/touch-feedback-2026-10-23';
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(dir + '/pointer-feedback-checks.json', JSON.stringify({ method: 'PostCSS audit of authored CSS with hover/pointer media fixtures; assumes a latched hover pseudo-state. Does not emulate physical touch or prove frame rendering.', hoverRuleCount: hoverRules.length, results }, null, 2));
console.log(results.length + ' pointer feedback checks passed.');
