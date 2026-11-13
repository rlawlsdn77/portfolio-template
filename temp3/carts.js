/* ─────────────────────────────────────────────────────────────
   temp3 카트리지 색 표 — 포트폴리오(temp3/index.html)와 발표 덱(temp3/deck.html)이 함께 씁니다.
   80년대 가정용 게임기 카트리지처럼 소프트마다 껍데기 색이 다릅니다. 실제 회사·게임기의 이름·로고는 쓰지 않습니다(모양과 색 인상만).

   · 색은 data/portfolio.json의 projects 순서대로 아래 SHELLS를 돌려 씁니다(첫 프로젝트 = 빨강, 둘째 = 노랑, 셋째 = 파랑 …).
   · 프로젝트마다 색을 고르고 싶으면 BY_ID에 폴더 이름과 색 이름을 적습니다. 예) { Shifter: 'black', OverFixed: 'green' }
   · shell = 껍데기 플라스틱 색 · ink = 라벨(장면) 안 강조 글자색의 바탕(발표 덱이 이 색으로 강조색을 다시 계산함)
   · 이 파일은 내용이 아니라 장식 색만 정합니다(글은 모두 data/·src/에서 옴).
   ───────────────────────────────────────────────────────────── */
window.T3Carts = (() => {
  const SHELLS = [
    { key: 'red',    name: 'RED',    shell: '#D8473A', ink: '#C63A2E' },
    { key: 'yellow', name: 'YELLOW', shell: '#EBB935', ink: '#B5600D' },
    { key: 'blue',   name: 'BLUE',   shell: '#2F7BD6', ink: '#2366C9' },
    { key: 'green',  name: 'GREEN',  shell: '#35A06F', ink: '#1F7F55' },
    { key: 'black',  name: 'BLACK',  shell: '#2D2C32', ink: '#C63A2E' },
    { key: 'purple', name: 'PURPLE', shell: '#7A57C8', ink: '#6744BC' },
    { key: 'orange', name: 'ORANGE', shell: '#EC7B2D', ink: '#C25312' },
    { key: 'cream',  name: 'CREAM',  shell: '#EDE6D4', ink: '#C63A2E' },
  ];
  const BY_ID = {};                       // 예) { Shifter: 'black' }
  const PLAYER = { key: 'cream', name: 'PLAYER', shell: '#EDE6D4', ink: '' };   // 맨 위 "내 카트리지"(이름표) — ink 비움 = profile.md 강조색

  // 밝은 껍데기(노랑·크림)는 위에 얹는 글자를 어둡게
  const lum = (hex) => {
    const n = parseInt(String(hex).replace('#', ''), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const isLight = (hex) => lum(hex) > 0.42;
  const hash = (s) => [...String(s)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

  // id의 껍데기 색. order = portfolio.json의 projects(없으면 이름으로 정한 색)
  function pick(id, order = []) {
    const want = SHELLS.find((s) => s.key === BY_ID[id]);
    if (want) return want;
    const i = order.indexOf(id);
    return SHELLS[(i < 0 ? hash(id) : i) % SHELLS.length];
  }
  // 껍데기 CSS 변수(밝은 쪽·어두운 쪽은 CSS color-mix로). --shell-on = 껍데기 위에 새긴 글자 색
  const vars = (s) => `--shell:${s.shell};--shell-on:${isLight(s.shell) ? '#1D1C21' : '#FFFFFF'};`;
  const apply = (el, s) => { el.style.setProperty('--shell', s.shell); el.style.setProperty('--shell-on', isLight(s.shell) ? '#1D1C21' : '#FFFFFF'); };
  return { SHELLS, BY_ID, PLAYER, pick, vars, apply, isLight };
})();
