/**
 * Termine: Firestore (wenn window.__firebase_config mit apiKey gesetzt) oder localStorage.
 */
(function () {
  var LOCAL_KEY = 'rck_termine_v1';
  var DEFAULT_ROWS = [
    { dateStr: 'März (jährlich)', title: 'Jahreshauptversammlung', location: 'Vorarlberg — genauer Termin wird bekannt gegeben', note: '' },
    { dateStr: 'Saison', title: 'Autoslalom St. Gallenkirch', location: 'Klostertal — Ausschreibung folgt', note: '' },
    { dateStr: 'Nach Saison', title: 'Gala / Preisverteilung', location: 'Traditionell mit Community', note: '' },
  ];

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return DEFAULT_ROWS.slice();
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_ROWS.slice();
    } catch (e) {
      return DEFAULT_ROWS.slice();
    }
  }

  function saveLocal(rows) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
    } catch (e) {}
  }

  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      var da = a.dateSort || a.dateStr || '';
      var db = b.dateSort || b.dateStr || '';
      return db.localeCompare(da);
    });
  }

  function renderTable(tbody, rows) {
    if (!tbody) return;
    tbody.innerHTML = '';
    sortRows(rows).forEach(function (row) {
      var tr = document.createElement('tr');
      tr.className = 'border-b border-white/10';
      tr.innerHTML =
        '<td class="whitespace-nowrap px-4 py-4 text-white/95 sm:px-6">' +
        escapeHtml(row.dateStr) +
        '</td><td class="px-4 py-4 sm:px-6">' +
        escapeHtml(row.title) +
        '</td><td class="px-4 py-4 sm:px-6">' +
        escapeHtml(row.location) +
        (row.note ? '<span class="mt-1 block text-sm text-rally-muted">' + escapeHtml(row.note) + '</span>' : '') +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function showTerminStatus(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('text-emerald-400', 'text-red-400', 'text-rally-muted');
    el.classList.add(ok ? 'text-emerald-400' : 'text-red-400');
  }

  function loadScripts(urls, done) {
    var i = 0;
    function next() {
      if (i >= urls.length) {
        done();
        return;
      }
      var s = document.createElement('script');
      s.src = urls[i++];
      s.onload = next;
      s.onerror = function () {
        done();
      };
      document.head.appendChild(s);
    }
    next();
  }

  function getDb() {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return null;
    try {
      return firebase.firestore();
    } catch (e) {
      return null;
    }
  }

  function init() {
    var tbody = document.getElementById('termine-tbody');
    var form = document.getElementById('termin-form');
    var statusEl = document.getElementById('termin-form-status');

    function refresh(rows) {
      renderTable(tbody, rows);
    }

    function afterLoad(rows) {
      refresh(rows);
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var fd = new FormData(form);
          var dateStr = (fd.get('dateStr') || '').toString().trim();
          var title = (fd.get('title') || '').toString().trim();
          var location = (fd.get('location') || '').toString().trim();
          var note = (fd.get('note') || '').toString().trim();
          if (!dateStr || !title || !location) {
            showTerminStatus(statusEl, 'Bitte Datum, Veranstaltung und Ort ausfüllen.', false);
            return;
          }
          var db = getDb();
          var payload = {
            dateStr: dateStr.slice(0, 80),
            title: title.slice(0, 200),
            location: location.slice(0, 200),
            note: note ? note.slice(0, 500) : '',
            dateSort: dateStr,
          };
          if (db) {
            db.collection('termine')
              .add(payload)
              .then(function () {
                showTerminStatus(statusEl, 'Termin gespeichert.', true);
                form.reset();
                return loadRows();
              })
              .then(refresh)
              .catch(function () {
                showTerminStatus(statusEl, 'Speichern fehlgeschlagen. Bitte später erneut versuchen.', false);
              });
          } else {
            var rows = loadLocal();
            rows.unshift(
              Object.assign({}, payload, {
                id: 'local_' + Date.now(),
              })
            );
            saveLocal(rows);
            showTerminStatus(statusEl, 'Termin lokal gespeichert (Browser). Für Team-Sync Firebase einrichten.', true);
            form.reset();
            refresh(rows);
          }
        });
      }
    }

    function loadRows() {
      var db = getDb();
      if (db) {
        return db
          .collection('termine')
          .orderBy('dateSort', 'desc')
          .limit(80)
          .get()
          .then(function (snap) {
            var out = [];
            snap.forEach(function (doc) {
              out.push(doc.data());
            });
            if (!out.length) return DEFAULT_ROWS.slice();
            return out;
          })
          .catch(function () {
            return loadLocal();
          });
      }
      return Promise.resolve(loadLocal());
    }

    loadRows().then(afterLoad);
  }

  function boot() {
    var cfg = window.__firebase_config;
    if (cfg && cfg.apiKey) {
      loadScripts(
        [
          'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
          'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
        ],
        function () {
          try {
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
              firebase.initializeApp(cfg);
            }
          } catch (e) {}
          init();
        }
      );
    } else {
      init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
