const fs = require('fs');
const path = require('path');

// Read the built index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Read all CSS and JS files
const assetsDir = path.join(__dirname, 'dist', 'assets');
const files = fs.readdirSync(assetsDir);

// Inline CSS
const cssFile = files.find(f => f.endsWith('.css'));
if (cssFile) {
  const css = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
  html = html.replace(/<link[^>]*href="[^"]*\.css"[^>]*>/g, `<style>${css}</style>`);
}

// Inline JS
const jsFile = files.find(f => f.endsWith('.js'));
if (jsFile) {
  const js = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  html = html.replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/g, `<script>${js}</script>`);
}

// Add offline manifest inline
const manifest = {
  "name": "Vault",
  "short_name": "Vault",
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#1a202c",
  "icons": [{
    "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iIzM3ODJmNiIvPjwvc3ZnPg==",
    "sizes": "192x192",
    "type": "image/svg+xml"
  }]
};

html = html.replace(
  '<link rel="manifest" href="/manifest.json" />',
  `<link rel="manifest" href="data:application/json;base64,${Buffer.from(JSON.stringify(manifest)).toString('base64')}" />`
);

// Write the offline version
fs.writeFileSync(path.join(__dirname, 'vault-offline.html'), html);
console.log('✅ Created vault-offline.html - fully self-contained!');