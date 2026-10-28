// Treo landing page. One learner model object; every view on the page is rendered from it.

const CAP = 0.15;
const BASE = { negnum: 0.48, twostep: 0.70, slope: 0.58, slopeint: 0.42, newton: 0.64 };
const NAMES = { negnum: 'negative numbers', twostep: 'two-step equations', slope: 'slope as a rate of change', slopeint: 'slope-intercept form', newton: 'Newton’s second law' };

// What the evidence step writes for each of Mandy's possible answers.
const EXCHANGES = {
  sign: {
    answer: 'y = 2x + 3', error: 'conceptual', root: 'negnum',
    delta: { negnum: -0.10, slopeint: -0.05 },
    tutor: 'You divided by 2 correctly. Now look at 4x: when you subtract it from both sides, what sign does it have on the right?',
    summary: 'Mandy isolated y but kept the sign of 4x when moving it across.',
    misconception: 'Keeps a term’s sign when it moves across the equals sign',
    move: '5-minute number-line warm-up: subtracting 4x is adding −4x. Then redo 4x + 2y = 6 together.',
    draft: 'Mandy, your division by 2 was right. Look again at 4x: when you subtract it from both sides, what does the right side become?',
    en: {
      worked: 'Mandy practiced rearranging equations to find y.',
      stuck: 'When a term moves across the equals sign, its sign should flip. That comes from working with negative numbers.',
      tryAt: ['Ask her to explain each step out loud.', 'Use money: owing $4 is −4.', 'Spend 5 minutes on a number line, adding and subtracting negatives.'],
      ask: '“If you owe me $4 and I cancel the debt, are you richer or poorer?”',
    },
    es: {
      worked: 'Mandy practicó cómo despejar y en una ecuación.',
      stuck: 'Cuando un término pasa al otro lado del signo igual, su signo debe cambiar. Eso viene de trabajar con números negativos.',
      tryAt: ['Pídale que explique cada paso en voz alta.', 'Usen dinero: deber $4 es −4.', 'Dediquen 5 minutos a una recta numérica, sumando y restando negativos.'],
      ask: '«Si me debes $4 y te perdono la deuda, ¿quedas con más o con menos?»',
    },
  },
  proc: {
    answer: 'y = −4x + 3', error: 'procedural', root: 'twostep',
    delta: { twostep: -0.08, slopeint: -0.04 },
    tutor: 'Good start: subtracting 4x was right. When you divide the right side by 2, which parts have to be divided?',
    summary: 'Mandy subtracted 4x correctly but divided only the 6 by 2.',
    misconception: 'Divides one term instead of the whole side',
    move: 'Box the whole side before dividing, then three quick items where every term must be divided.',
    draft: 'Mandy, subtracting 4x was right. When you divide by 2, which terms on the right side need dividing?',
    en: {
      worked: 'Mandy practiced rearranging equations to find y.',
      stuck: 'On the last step: when you divide one side of an equation, every part of it has to be divided. That’s a skill from two-step equations.',
      tryAt: ['Ask her to explain each step out loud.', 'Share food: if two people split 4 slices and 6 slices, each gets half of both.', 'Have her check an answer by putting x = 1 back in.'],
      ask: '“If we split the bill and the tip, do we halve both?”',
    },
    es: {
      worked: 'Mandy practicó cómo despejar y en una ecuación.',
      stuck: 'En el último paso: al dividir un lado de la ecuación, hay que dividir cada parte. Eso viene de las ecuaciones de dos pasos.',
      tryAt: ['Pídale que explique cada paso en voz alta.', 'Repartan comida: si dos personas se reparten 4 y 6 porciones, cada una recibe la mitad de ambas.', 'Que compruebe una respuesta poniendo x = 1 en la ecuación.'],
      ask: '«Si dividimos la cuenta y la propina, ¿dividimos las dos a la mitad?»',
    },
  },
  correct: {
    answer: 'y = −2x + 3', error: 'none', root: null,
    delta: { slopeint: 0.12, negnum: 0.05, twostep: 0.04 },
    tutor: 'Yes. How could you check it? Try putting x = 1 into the original equation and into yours.',
    summary: 'Mandy solved 4x + 2y = 6 correctly in two steps.',
    misconception: 'None in this exchange',
    move: 'Stretch: ask Mandy to graph y = −2x + 3 and read the slope from the graph.',
    draft: 'Nice work, Mandy. You kept the sign of 4x straight and divided every term by 2.',
    en: {
      worked: 'Mandy practiced rearranging equations to find y.',
      stuck: 'Nowhere today: she solved the problem and kept track of every sign.',
      tryAt: ['Ask her to explain each step out loud, as if teaching you.', 'Have her check an answer by putting x = 1 back in.', 'Ask where she sees straight-line patterns, like a phone plan’s monthly cost.'],
      ask: '“What’s one thing in math you could teach me tonight?”',
    },
    es: {
      worked: 'Mandy practicó cómo despejar y en una ecuación.',
      stuck: 'En ningún momento: resolvió el problema y cuidó cada signo.',
      tryAt: ['Pídale que explique cada paso en voz alta, como si le enseñara a usted.', 'Que compruebe una respuesta poniendo x = 1 en la ecuación.', 'Pregúntele dónde ve patrones en línea recta, como el costo mensual de un plan de teléfono.'],
      ask: '«¿Qué cosa de matemáticas me podrías enseñar esta noche?»',
    },
  },
};

const LABELS = {
  en: { worked: 'This week', stuck: 'Where she got stuck', tryAt: 'Try at home', ask: 'Ask her', shared: 'Shared by the school' },
  es: { worked: 'Esta semana', stuck: 'Dónde se trabó', tryAt: 'Para hacer en casa', ask: 'Pregúntele', shared: 'Compartido por la escuela' },
};
const VIEW_TITLES = { student: 'Student · Socratic tutor', teacher: 'Teacher · copilot', parent: 'Parent · weekly guide' };

const state = { answer: 'sign', view: 'student', lang: 'en', approval: null };

const clamp = (v) => Math.max(0, Math.min(1, v));
const capped = (d) => Math.max(-CAP, Math.min(CAP, d));
const fmt = (v) => v.toFixed(2);
const signed = (d) => (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d).toFixed(2);
const out = (key) => document.querySelectorAll(`[data-out="${key}"]`);
const setText = (key, text) => out(key).forEach((el) => { el.textContent = text; });

function model() {
  const ex = EXCHANGES[state.answer];
  const m = {};
  for (const k of Object.keys(BASE)) m[k] = clamp(BASE[k] + capped(ex.delta[k] || 0));
  return m;
}

function render() {
  const ex = EXCHANGES[state.answer];
  const m = model();

  // the learner model itself, wherever it appears
  document.querySelectorAll('[data-concept]').forEach((li) => {
    const k = li.dataset.concept;
    li.querySelector('.bar i').style.setProperty('--m', m[k]);
    li.querySelector('.val').textContent = fmt(m[k]);
    li.classList.toggle('is-root', ex.root === k);
  });
  const main = ex.root || 'slopeint';
  const d = capped(ex.delta[main] || 0);
  setText('answerText', ex.answer);
  setText('errorType', ex.error);
  setText('rootName', ex.root ? NAMES[ex.root] : 'none needed');
  setText('changeText', `${NAMES[main]} ${signed(d)} (cap ${CAP})`);

  // student
  document.querySelectorAll('[data-answer]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.answer === state.answer)));
  setText('tutor', ex.tutor);

  // teacher
  setText('summary', ex.summary);
  setText('misconception', ex.misconception);
  out('errorTag').forEach((el) => { el.textContent = ex.error; el.classList.toggle('none', ex.error === 'none'); });
  setText('rootLong', ex.root ? `${NAMES[ex.root]} (${fmt(m[ex.root])})` : 'none: no gap found in this exchange');
  setText('move', ex.move);
  setText('draft', ex.draft);
  setText('approval', state.approval === 'approved' ? 'Approved. Added to Mandy’s record.' : state.approval === 'rejected' ? 'Rejected. Nothing was sent.' : 'Nothing reaches Mandy’s record until you approve it.');

  // parent
  const p = ex[state.lang], L = LABELS[state.lang];
  setText('pWorkedLabel', L.worked); setText('pStuckLabel', L.stuck); setText('pTryLabel', L.tryAt); setText('pAskLabel', L.ask); setText('shared', L.shared);
  setText('pWorked', p.worked); setText('pStuck', p.stuck); setText('pAsk', p.ask);
  out('pTry').forEach((ul) => { ul.replaceChildren(...p.tryAt.map((t) => Object.assign(document.createElement('li'), { textContent: t }))); });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  document.querySelector('#pane-parent .guide')?.setAttribute('lang', state.lang);

  // which view
  setText('viewTitle', VIEW_TITLES[state.view]);
  document.querySelectorAll('[data-pane]').forEach((pane) => { pane.hidden = pane.dataset.pane !== state.view; });
  document.querySelectorAll('[data-tab]').forEach((t) => {
    const on = t.dataset.tab === state.view;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.answer) { state.answer = t.dataset.answer; state.approval = null; }
  else if (t.dataset.tab) state.view = t.dataset.tab;
  else if (t.dataset.lang) state.lang = t.dataset.lang;
  else if (t.hasAttribute('data-approve')) state.approval = 'approved';
  else if (t.hasAttribute('data-reject')) state.approval = 'rejected';
  else if (t.hasAttribute('data-reset')) { Object.assign(state, { answer: 'sign', view: 'student', lang: 'en', approval: null }); document.getElementById('tab-student').focus(); }
  else return;
  render();
});

// arrow keys move between the view tabs
document.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const i = tabs.findIndex((t) => t.dataset.tab === state.view);
  const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
  if (n === null) return;
  e.preventDefault();
  const next = tabs[(n + tabs.length) % tabs.length];
  state.view = next.dataset.tab; render(); next.focus();
});

render();

// accordion of tinted panels: one open at a time
(() => {
  const acc = document.querySelector('[data-acc]');
  if (!acc) return;
  const panels = [...acc.querySelectorAll('.acc-panel')];
  acc.addEventListener('click', (e) => {
    const btn = e.target.closest('.acc-toggle');
    if (!btn) return;
    panels.forEach((p) => {
      const on = p.contains(btn);
      p.classList.toggle('is-open', on);
      p.querySelector('.acc-toggle').setAttribute('aria-expanded', String(on));
    });
  });
})();

// reveal once as each part enters the screen; never leaves content hidden
(() => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();
