import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {load} from './verify-i18n.mjs';
const require=createRequire(import.meta.url);
const React=require('react');
const {jsx,jsxs}=require('react/jsx-runtime');
const {renderToString}=require('react-dom/server');
const {translateTree}=load('src/i18n/translate.tsx');
const {serverTranslator}=load('src/i18n/server.ts');
assert.notEqual(process.env.NODE_ENV,'production','This regression must exercise React development validation');
const checks=[];
function check(name,run){run();checks.push(name);console.log('PASS '+name);}
check('static JSX, nested fragments and icon children render without development key warnings',()=>{
 const errors=[];const previous=console.error;console.error=(...args)=>errors.push(args.map(String).join(' '));
 try{for(const locale of ['id','en']){const source=jsxs('footer',{children:[jsxs('a',{href:'/about',children:['Tentang ',jsx('span',{children:'→'})]}),jsxs(React.Fragment,{children:[jsx('h2',{children:'Pengalaman.'}),null,jsx('p',{children:'Keterampilan'})]})]});const html=renderToString(translateTree(source,serverTranslator(locale),locale));assert.ok(html.includes(locale==='en'?'Experience.':'Pengalaman.'));assert.ok(html.includes(locale==='en'?'/en/about':'/about'));}}finally{console.error=previous;}
 assert.deepEqual(errors,[]);
});
check('keyed records keep their identities across locale changes and reordering',()=>{
 const record=id=>jsx('li',{'data-record':id,children:id},id);
 const keys=(ids,locale)=>new Map(translateTree(ids.map(record),serverTranslator(locale),locale).map(node=>[node.props['data-record'],node.key]));
 const id=keys(['first','second'],'id'),en=keys(['second','first'],'en');assert.equal(id.get('first'),en.get('first'));assert.equal(id.get('second'),en.get('second'));
});
check('native bootstrap/resource nodes are opaque and retain their original React element',()=>{
 for(const type of ['script','style','link','meta']){const source=jsx(type,{src:type==='script'?'/bootstrap.js':undefined,children:type==='style'?'body{}':undefined});assert.equal(translateTree(source,serverTranslator('en'),'en'),source);}
});
check('event handlers and refs survive translation',()=>{
 const handler=()=>{},ref=()=>{};const source=jsx('button',{ref,onClick:handler,children:'Kembali ke Home'});const result=translateTree(source,serverTranslator('en'),'en');assert.equal(result.props.ref,ref);assert.equal(result.props.onClick,handler);assert.equal(result.props.children,'Back to Home');
});
check('protected user content is neither re-created nor translated',()=>{
 const source=jsx('p',{'data-no-translate':true,children:'Keterampilan'});assert.equal(translateTree(source,serverTranslator('en'),'en'),source);
});
check('mixed and nested children preserve rendered text order',()=>{
 const source=jsxs('div',{children:['A',null,[jsx('span',{children:'B'},'b'),'C'],false,'D']});assert.equal(renderToString(translateTree(source,serverTranslator('id'),'id')),renderToString(source));
});
check('initial server HTML retains the executable next-themes bootstrap',()=>{
 const {ThemeProvider}=load('src/providers/ThemeProvider.tsx');const html=renderToString(jsx(ThemeProvider,{children:jsx('p',{children:'Theme content'})}));const bootstrap=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].find(match=>match[2].includes('prefers-color-scheme'));
 assert.ok(bootstrap,'SSR theme bootstrap is missing');assert.doesNotMatch(bootstrap[1],/type="text\/plain"/);assert.ok(html.includes('Theme content'));
});
fs.mkdirSync('docs/execution/evidence/turbopack-i18n-fix-2026-10-23',{recursive:true});fs.writeFileSync('docs/execution/evidence/turbopack-i18n-fix-2026-10-23/react-tree-regressions.json',JSON.stringify({mode:'React development',checks},null,2));
