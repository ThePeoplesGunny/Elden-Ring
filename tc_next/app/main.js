// Tarnished's Companion — main entry.
// Phase A scaffold: just a status banner confirming the bundle loads.
// Real UI ported/rebuilt in Phase A.4 and Phase D.

(function () {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = '';

  const h = React.createElement;

  function Banner() {
    return h('div', { style: { padding: '2rem', fontFamily: 'monospace' } },
      h('h1', { style: { color: '#f0c060', margin: 0 } }, "Tarnished's Companion"),
      h('p', { style: { color: '#888', marginTop: 8 } },
        'Portable bundle active. Phase A scaffold — engine/data/UI migrating from legacy monolith.'),
      h('p', { style: { color: '#666', fontSize: 12 } },
        'See ../REWRITE_PLAN.md for phasing.')
    );
  }

  ReactDOM.render(h(Banner), root);
})();
