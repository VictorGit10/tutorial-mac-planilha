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

// Animação: arrastar a pasta do Finder para o Terminal
(function () {
  var stage = document.getElementById('stage');
  if (!stage) return;
  var $ = function (id) { return document.getElementById(id); };
  var cursor = $('s-cursor'), ghost = $('s-ghost'), folder = $('s-folder');
  var cmd = $('s-cmd'), path = $('s-path'), caret = $('s-caret'), next = $('s-next');
  var term = stage.querySelector('.sw-t');
  var phases = document.querySelectorAll('#phases li');
  var btn = $('s-pause');
  var PATH = '/Users/seunome/Downloads/Universal2026\\ -\\ Pacote\\ Laerte ';
  var PROMPT = 'seunome@MacBook Universal2026 - Pacote Laerte %';
  var paused = false, visible = false;

  function phase(n) { phases.forEach(function (li) { li.classList.toggle('on', +li.dataset.p === n); }); }
  function pos(el, x, y) { el.style.left = x + '%'; el.style.top = y + '%'; }
  function folderPoint() {
    var s = stage.getBoundingClientRect(), f = folder.querySelector('.folder').getBoundingClientRect();
    return {
      x: (f.left + f.width / 2 - s.left) / s.width * 100,
      y: (f.top + f.height / 2 - s.top) / s.height * 100,
      gx: (f.left - s.left) / s.width * 100,
      gy: (f.top - s.top) / s.height * 100
    };
  }
  async function wait(ms) {
    var t = 0;
    while (t < ms || paused || !visible) {
      await new Promise(function (r) { setTimeout(r, 50); });
      if (!paused && visible) t += 50;
    }
  }
  function reset() {
    cmd.textContent = ''; path.textContent = ''; next.innerHTML = '';
    caret.hidden = false; ghost.classList.remove('on'); folder.classList.remove('picked');
    term.classList.remove('hot'); cursor.classList.remove('down', 'slow'); path.classList.remove('flash');
    pos(cursor, 30, 82); phase(0);
  }
  function finalFrame() {
    reset(); cmd.textContent = 'cd '; path.textContent = PATH; phase(3);
  }

  async function loop() {
    for (;;) {
      reset();
      await wait(900);
      phase(1);
      for (var c of 'cd ') { cmd.textContent += c; await wait(260); }
      await wait(700);

      phase(2);
      var p = folderPoint();
      pos(cursor, p.x, p.y);
      await wait(1100);
      cursor.classList.add('down');
      folder.classList.add('picked');
      ghost.style.transition = 'none';
      pos(ghost, p.gx, p.gy);
      void ghost.offsetWidth;
      ghost.style.transition = '';
      ghost.classList.add('on');
      await wait(700);

      phase(3);
      var dx = 70, dy = 52;
      cursor.classList.add('slow');
      pos(cursor, dx, dy);
      pos(ghost, dx - (p.x - p.gx), dy - (p.y - p.gy));
      await wait(900);
      term.classList.add('hot');
      await wait(600);
      cursor.classList.remove('down', 'slow');
      ghost.classList.remove('on');
      folder.classList.remove('picked');
      term.classList.remove('hot');
      path.textContent = PATH;
      path.classList.add('flash');
      await wait(2000);

      phase(4);
      caret.hidden = true;
      next.innerHTML = '\n<span class="ps">' + PROMPT + '</span> <span class="caret"></span>';
      await wait(3200);
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finalFrame();
    btn.hidden = true;
    return;
  }
  btn.addEventListener('click', function () {
    paused = !paused;
    btn.textContent = paused ? 'Continuar' : 'Pausar';
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(stage);
  } else {
    visible = true;
  }
  finalFrame();
  loop();
})();
