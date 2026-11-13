/* ─────────────────────────────────────────────────────────────
   temp3 발표 덱 — 카트리지 껍데기 (temp3/deck.html만 싣음. common.js 다음, project-deck.js 앞)
   장면(1280×720)은 카트리지 앞면의 "라벨"이고, 이 스크립트는 그 둘레의 껍데기를 그립니다(장면 밖 화면 전용 장식 — 인쇄·PDF·PPTX에는 없음).
     · 위 = 책등 라벨(소프트 번호 · 프로젝트 제목 · 지금 장 이름)
     · 옆 = 손잡이 홈 · 라벨이 들어앉은 오목한 테
     · 아래 = 금속 접점. 장면 수만큼 있고 지금 장면이 켜짐(누르면 그 장면으로). 껍데기 왼쪽·오른쪽 반을 누르면 이전·다음 장면
   덱 키트(assets/deck-kit.js)는 장면을 화면 가득 맞추므로, 껍데기를 켠 동안만 장면 자리(--c-x · --c-y · --c-k)를 껍데기 창에 맞게 다시 정합니다.
   껍데기 끄기: 아래 띠의 [카트리지] 단추 또는 C 키(고른 것은 이 브라우저에만 기억). 좁은 화면(가로 640 · 세로 380 미만)과 [한 번에 보기]에서는 저절로 꺼집니다.
   프로젝트 색: temp3/carts.js(포트폴리오와 같은 표). 렌더러가 강조색을 계산하기 직전에 --t-accent를 그 프로젝트 색으로 바꿉니다(PF.applyTheme 감싸기).
   렌더러 파일은 고치지 않습니다 — PF.loadJSON · PF.applyTheme을 감싸 값을 엿보고 바꾸기만 합니다.
   ───────────────────────────────────────────────────────────── */
(() => {
  const root = document.documentElement;
  const id = new URLSearchParams(location.search).get('p') || '';
  const W = 1280, H = 720, HUD = 44;
  const KEY = 'pf-t3-shell';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* 저장 못 해도 동작 */ } },
  };
  let off = store.get() === 'off';
  let hudBtn = null;                                              // 아래 띠의 [카트리지] 단추(⑥에서 만듦)
  const hasPF = typeof PF === 'object' && PF;                     // common.js의 PF는 최상위 const라 window.PF가 아님
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ── ① 프로젝트 순서 · 제목을 엿보고, 강조색을 그 카트리지 색으로 ──
  let order = [], title = '', shell = T3Carts.pick(id, []);
  if (hasPF && PF.loadJSON) {
    const loadJSON = PF.loadJSON;
    PF.loadJSON = async (u, ...rest) => {
      const r = await loadJSON.call(PF, u, ...rest);
      const s = String(u);
      if (/(^|\/)data\/portfolio\.json$/.test(s) && r && Array.isArray(r.projects)) { order = r.projects; shell = T3Carts.pick(id, order); paint(); }
      else if (/(^|\/)data\/projects\//.test(s) && r && r.title) { title = r.title; paint(); }
      return r;
    };
  }
  if (hasPF && PF.applyTheme) {
    const applyTheme = PF.applyTheme;
    PF.applyTheme = (hex) => {
      if (shell.ink) ['--t-accent', '--t-accent-2', '--t-accent-3'].forEach((k) => root.style.setProperty(k, shell.ink));
      return applyTheme.call(PF, hex);
    };
  }

  // ── ② 껍데기 ──
  const cart = document.createElement('div');
  cart.className = 't3-cart pf-screen-only';
  // 접점 띠를 껍데기보다 먼저 두어, 띠 윗부분이 껍데기 밑으로 들어간 것처럼 보이게
  cart.innerHTML = `<div class="t3-pins" aria-hidden="true"></div>
    <div class="t3-shell" aria-hidden="true">
      <i class="t3-grip l"></i><i class="t3-grip r"></i><i class="t3-window"></i>
      <div class="t3-spine"><span class="t3-no"></span><b class="t3-name"></b><span class="t3-sec"></span></div>
      <div class="t3-foot"><i class="t3-groove"></i><i class="t3-arrow"></i><i class="t3-groove"></i></div>
    </div>`;
  const $ = (q) => cart.querySelector(q);
  const deckEl = document.getElementById('deck');
  (deckEl || document.body.firstChild)?.before?.(cart);

  function paint() {
    T3Carts.apply(root, shell);                                    // 껍데기 · [한 번에 보기]의 장면 테두리가 함께 씀
    const i = order.indexOf(id);
    $('.t3-no').textContent = i >= 0 ? `No.${pad2(i + 1)}` : 'No.--';
    $('.t3-name').textContent = title || id;
  }
  paint();

  // ── ③ 자리 잡기: 껍데기 두께를 뺀 창에 1280×720 장면을 맞춤 ──
  const clamp = (a, x, b) => Math.max(a, Math.min(b, x));
  const px = (n) => `${Math.round(n * 100) / 100}px`;
  let fits = true;                                                 // 껍데기를 둘 수 있는 보기·크기인지(덱 보기 · 가로 640 · 세로 380 이상 · 전체 화면 아님)
  function layout() {
    const vw = root.clientWidth, vh = innerHeight - HUD;
    fits = root.dataset.view === 'deck' && vw >= 640 && vh >= 380 && !document.fullscreenElement;
    const on = fits && !off;
    root.classList.toggle('t3-on', on);
    syncHud();
    if (!on) return;
    const side = Math.round(clamp(14, vw * 0.022, 32)), top = Math.round(clamp(22, vh * 0.042, 34));
    const bot = Math.round(clamp(18, vh * 0.034, 28)), pins = Math.round(clamp(9, vh * 0.016, 14)), m = Math.round(clamp(6, Math.min(vw, vh) * 0.012, 12));
    const k = Math.min((vw - 2 * m - 2 * side) / W, (vh - 2 * m - top - bot - pins) / H);
    const cw = W * k + 2 * side, ch = H * k + top + bot + pins;
    const l = (vw - cw) / 2, t = (vh - ch) / 2;
    const v = { '--c-k': String(k), '--c-x': px(l + side), '--c-y': px(t + top), '--c-l': px(l), '--c-t': px(t), '--c-w': px(cw), '--c-h': px(ch),
      '--c-side': px(side), '--c-top': px(top), '--c-bot': px(bot), '--c-pins': px(pins), '--c-r': px(14 * k) };
    Object.entries(v).forEach(([n, x]) => root.style.setProperty(n, x));
  }
  addEventListener('resize', layout);
  document.addEventListener('fullscreenchange', layout);          // F(전체 화면) = 껍데기 없이 크게
  new MutationObserver(layout).observe(root, { attributes: true, attributeFilter: ['data-view'] });
  layout();

  // ── ④ 지금 장면 ↔ 책등 장 이름 · 접점 ──
  let scenes = [], cur = -1, queued = false;
  function buildPins() {
    $('.t3-pins').innerHTML = scenes.map((s, i) => `<i data-i="${i}" title="${i + 1} · ${esc(s.dataset.sec || '')}"></i>`).join('');
  }
  function sync() {
    queued = false;
    if (!deckEl) return;
    const list = [...deckEl.children].filter((e) => e.classList.contains('pf-scene'));
    if (list.length !== scenes.length || list.some((s, i) => s !== scenes[i])) { scenes = list; buildPins(); cur = -1; }
    const i = scenes.findIndex((s) => s.classList.contains('pf-cur'));
    if (i < 0 || i === cur) return;
    const first = cur < 0;
    cur = i;
    $('.t3-sec').textContent = scenes[i].dataset.sec || '';
    $('.t3-pins').querySelectorAll('i').forEach((p, j) => { p.classList.toggle('on', j === i); p.classList.toggle('past', j < i); });
    if (!first && !reduced()) { cart.classList.remove('t3-bump'); void cart.offsetWidth; cart.classList.add('t3-bump'); }
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(sync); } };
  if (deckEl) new MutationObserver(queue).observe(deckEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  // ── ⑤ 누르기: 접점 = 그 장면, 껍데기 왼쪽·오른쪽 반 = 이전·다음 ──
  cart.addEventListener('click', (e) => {
    if (!root.classList.contains('t3-on') || !window.PFScene || cur < 0) return;
    const pin = e.target.closest('.t3-pins i');
    if (pin) { PFScene.go(+pin.dataset.i); return; }
    if (!e.target.closest('.t3-shell')) return;
    const r = scenes[cur].getBoundingClientRect();
    PFScene.go(cur + (e.clientX < (r.left + r.right) / 2 ? -1 : 1));
  });

  // ── ⑥ 껍데기 켜고 끄기: 아래 띠 [카트리지] 단추 · C 키 ──
  function syncHud() {
    if (!hudBtn) return;
    hudBtn.setAttribute('aria-pressed', String(!off));
    hudBtn.hidden = !fits;                                          // 껍데기를 둘 수 없을 때(한 번에 보기 · 좁은 화면 · 전체 화면)는 단추도 숨김
  }
  function toggle() { off = !off; store.set(off ? 'off' : ''); layout(); }
  function addHudButton() {
    const hud = document.querySelector('.pf-hud');
    if (!hud || hudBtn) return !!hud;
    hudBtn = document.createElement('button');
    hudBtn.type = 'button';
    hudBtn.className = 't3-hud-btn';
    hudBtn.title = '카트리지 껍데기 보이기·숨기기 (C)';
    hudBtn.innerHTML = '<span aria-hidden="true" class="ic"></span> <span class="l">카트리지</span>';
    hudBtn.addEventListener('click', toggle);
    (hud.querySelector('[data-a="overview"]') || hud.lastChild).before(hudBtn);
    syncHud();
    return true;
  }
  if (!addHudButton()) {
    const mo = new MutationObserver(() => { if (addHudButton()) mo.disconnect(); });
    mo.observe(document.body, { childList: true });
  }
  addEventListener('keydown', (e) => {
    if ((e.key !== 'c' && e.key !== 'C') || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented || !fits) return;   // 껍데기가 안 보이는 곳에서는 몰래 바꾸지 않음
    if (e.target.closest?.('input, textarea, select, [contenteditable="true"]') || document.querySelector('dialog[open]')) return;
    e.preventDefault(); toggle();
  });

  // ── ⑦ 덱 안 링크를 temp3로: [← 포트폴리오]는 temp3 페이지의 이 프로젝트 절로, 카드에 보이는 주소는 실제 주소로 ──
  //   <base href="../"> 때문에 그대로 두면 원본 포트폴리오(맨 위 index.html)로 갑니다. 상세 문서(doc.html)는 원본 그대로입니다.
  const BACK = `temp3/${id ? `#p-${encodeURIComponent(id)}` : ''}`;
  const fixUrl = (t) => t.replace('/temp3/doc.html', '/doc.html').replace('/temp3/project.html', '/temp3/deck.html');
  function fixLinks() {
    document.querySelectorAll('a[href="index.html"]').forEach((a) => a.setAttribute('href', BACK));
    document.querySelectorAll('.url').forEach((u) => { if (u.children.length) return; const t = u.textContent, n = fixUrl(t); if (n !== t) u.textContent = n; });
  }
  const onDown = (e) => { const a = e.target.closest?.('a[href="index.html"]'); if (a) a.setAttribute('href', BACK); };
  document.addEventListener('click', onDown, true);
  document.addEventListener('auxclick', onDown, true);
  new MutationObserver(fixLinks).observe(document.body, { childList: true, subtree: true });
  fixLinks();
})();
