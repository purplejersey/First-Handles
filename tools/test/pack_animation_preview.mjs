// Optional offline review artifact; no dependencies or changes to the app build.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const imports = {};
const data = file => `data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;
function moduleFile(relative) {
  const key = `fh/${relative.replaceAll('\\', '/')}`;
  if (imports[key]) return key;
  let source = fs.readFileSync(path.join(root, relative), 'utf8');
  source = source.replace(/new URL\("([^"]+)", import.meta.url\).href/g,
    (_, asset) => JSON.stringify(data(path.resolve(root, path.dirname(relative), asset))));
  if (relative.endsWith('avatar.js')) {
    const assets = Object.fromEntries(fs.readdirSync(path.join(root, 'assets/avatar'))
      .filter(f => f.endsWith('.webp')).map(f => [f.slice(0, -5), data(path.join(root, 'assets/avatar', f))]));
    source = source.replace(/const ASSET = .*?;/, `const ASSETS = ${JSON.stringify(assets)}; const ASSET = name => ASSETS[name];`);
  }
  source = source.replace(/(import\s+(?:[^'";]*?from\s+)?)["'](\.[^"']+)["']/g,
    (_, prefix, target) => `${prefix}${JSON.stringify(moduleFile(path.posix.normalize(path.posix.join(path.posix.dirname(relative), target))))}`);
  imports[key] = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  return key;
}
const entry = moduleFile('dev/animation-preview.js');
let html = fs.readFileSync('dev/animation-preview.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="../css/styles.css">', `<style>${fs.readFileSync('css/styles.css', 'utf8')}</style>`);
html = html.replace('<script type="module" src="./animation-preview.js"></script>',
  `<script type="importmap">${JSON.stringify({imports})}</script><script type="module">import ${JSON.stringify(entry)};</script>`);
fs.mkdirSync('dev/review', {recursive:true});
fs.writeFileSync('dev/review/phone-preview.html', html);
console.log('Created dev/review/phone-preview.html (self-contained offline review)');
