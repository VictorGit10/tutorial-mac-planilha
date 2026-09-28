// Botões "Copiar"
document.querySelectorAll('.cc button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var code = btn.parentElement.querySelector('code');
    var text = code.textContent;
    var ok = function () {
      btn.textContent = 'Copiado';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = 'Copiar'; btn.classList.remove('done'); }, 1600);
    };
    var fallback = function () {
      var r = document.createRange();
      r.selectNodeContents(code);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      try { if (document.execCommand('copy')) ok(); } catch (e) {}
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  });
});

// Terminal "digitando"
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

async function play(term) {
  if (term.dataset.busy) return;
  term.dataset.busy = '1';
  var lines = term.querySelectorAll('.ln');
  lines.forEach(function (l) { l.classList.add('off'); });
  term.querySelectorAll('.drop').forEach(function (d) { d.classList.add('off'); d.classList.remove('flash'); });
  await sleep(300);
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    var cmd = l.querySelector('.cmd');
    if (cmd) cmd.textContent = '';
    l.classList.remove('off');
    if (cmd) {
      await sleep(500);
      var t = cmd.dataset.t;
      for (var j = 0; j < t.length; j++) {
        cmd.textContent += t[j];
        await sleep(45);
      }
      var drop = l.querySelector('.drop');
      if (drop) {
        await sleep(900);
        drop.classList.remove('off');
        drop.classList.add('flash');
      }
      await sleep(600);
    } else {
      await sleep(250);
    }
  }
  delete term.dataset.busy;
}

document.querySelectorAll('[data-play]').forEach(function (term) {
  term.querySelector('.replay').addEventListener('click', function () { play(term); });
});

if (!reduce && 'IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); play(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-play]').forEach(function (t) { io.observe(t); });
}
