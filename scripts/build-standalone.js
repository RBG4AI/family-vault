import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const assets = path.join(dist, 'assets');
const files = fs.readdirSync(assets);

const escapeInline = (source, tag) =>
  source.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);

html = html.replace(/<link rel="manifest"[^>]*>/, '');
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
html = html.replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/, '');

const cssFile = files.find((file) => file.endsWith('.css'));
if (cssFile) {
  const css = escapeInline(fs.readFileSync(path.join(assets, cssFile), 'utf8'), 'style');
  html = html.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/, () => `<style>${css}</style>`);
}

const jsFile = files.find((file) => file.endsWith('.js'));
if (jsFile) {
  const js = escapeInline(fs.readFileSync(path.join(assets, jsFile), 'utf8'), 'script');
  html = html.replace('</body>', () => `<script>${js}</script>\n  </body>`);
}

const iconPath = path.join(dist, 'icon.svg');
if (fs.existsSync(iconPath)) {
  const icon = fs.readFileSync(iconPath, 'utf8');
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`;
  html = html.split('./icon.svg').join(dataUri);
}

const outFile = path.join(root, 'FamilyVault.html');
fs.writeFileSync(outFile, html);
console.log(`Wrote ${outFile}`);
