// Phase A.4: extract legacy <script> content into a single browser-loadable
// app module. Mechanical port — no behavior changes. Produces
// tc_next/app/legacy_inline.js which, combined with React vendor scripts and
// a new index.html, should run identically to the legacy monolith.
//
// Run: node scripts/phase_a_extract_app.js

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const HTML = path.join(REPO, 'Tarnished_Companion_v3.9.html');
const OUT_DIR = path.join(REPO, 'tc_next', 'app');
const OUT = path.join(OUT_DIR, 'legacy_inline.js');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const html = fs.readFileSync(HTML, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('inline <script> not found');
const body = scriptMatch[1];

// Remove any ReactDOM.render call — main.js will handle mounting so we can
// insert our own error boundaries + dev hooks.
const lines = body.split('\n');
const cleaned = [];
let skippedMount = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip the mount line: ReactDOM.render(React.createElement(App), document.getElementById('root'))
  if (/ReactDOM\.render\s*\(/.test(line)) {
    skippedMount = true;
    // Start of mount — skip through end of statement (may span multiple lines)
    let open = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
    if (open === 0) continue; // single-line mount
    for (i = i + 1; i < lines.length; i++) {
      const cont = lines[i];
      open += (cont.match(/\(/g) || []).length - (cont.match(/\)/g) || []).length;
      if (open <= 0) break;
    }
    continue;
  }
  cleaned.push(line);
}

const header = `// tc_next/app/legacy_inline.js — Phase A.4 port.
// Verbatim content of legacy Tarnished_Companion_v3.9.html's inline <script>.
// The legacy ReactDOM.render(...) mount has been stripped; app/main.js handles
// mounting instead. Everything else is unchanged.
//
// Regenerate via: node scripts/phase_a_extract_app.js
//
// This file intentionally runs at script load (not as a module) to preserve
// the legacy global-scope semantics: engine data, constants, and the App
// component all become window globals just as they did in the monolith.

`;

fs.writeFileSync(OUT, header + cleaned.join('\n'));

const stat = fs.statSync(OUT);
console.log(`Wrote ${OUT}`);
console.log(`  size: ${(stat.size / 1024).toFixed(1)} KB`);
console.log(`  lines: ${cleaned.length}`);
console.log(`  ReactDOM.render stripped: ${skippedMount ? 'yes' : 'NO (manual review needed)'}`);
