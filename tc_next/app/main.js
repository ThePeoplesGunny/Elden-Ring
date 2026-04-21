// tc_next/app/main.js — mount the legacy App component into #root.
// Phase A.4 port. In Phase D this gets replaced with a multi-view router.

(function () {
  const root = document.getElementById('root');
  if (!root) {
    console.error("tc_next: #root element not found.");
    return;
  }
  if (typeof App === 'undefined') {
    root.innerHTML =
      '<div style="padding:2rem;font-family:monospace;color:#f55">' +
      '  legacy_inline.js did not define App.<br>' +
      '  Check that app/legacy_inline.js loaded before main.js.' +
      '</div>';
    console.error("tc_next: App component not defined on window.");
    return;
  }

  try {
    ReactDOM.render(React.createElement(App), root);
  } catch (err) {
    root.innerHTML =
      '<div style="padding:2rem;font-family:monospace;color:#f55">' +
      '  <b>Mount error:</b> ' + String(err && err.message) + '<br>' +
      '  <pre style="color:#888;white-space:pre-wrap">' + String(err && err.stack) + '</pre>' +
      '</div>';
    console.error("tc_next: mount failed", err);
  }
})();
