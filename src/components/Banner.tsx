import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { company, type PanelId } from '../data/content';
import Mark from './Mark';
import Network from './Network';

const menu: { id: PanelId; label: string; short: string }[] = [
  { id: 'how', label: 'Platform', short: 'Platform' },
  { id: 'who', label: 'Who It’s For', short: 'For' },
  { id: 'about', label: 'About', short: 'About' },
  { id: 'demo', label: 'Book a Demo', short: 'Demo' },
];

type Snaps = { slim: number; normal: number; max: number };
type Mode = keyof Snaps;
const ORDER: Mode[] = ['slim', 'normal', 'max'];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Snap heights are worked out from the screen, so the page always fits without scrolling.
function measure(): Snaps {
  const H = window.innerHeight;
  const mobile = window.innerWidth <= 820;
  const slim = mobile ? 58 : 66;
  const deck = (document.querySelector('.deck') as HTMLElement | null)?.offsetHeight ?? 240;
  const room = H - deck - (mobile ? 318 : 305); // keep the assistant (and flow rail) usable
  const max = clamp(Math.min(room, H * 0.56), slim + 130, 640);
  const normal = clamp(H * (mobile ? 0.28 : 0.3), slim + 110, max - 50);
  return { slim, normal, max };
}

// Elastic resistance when pulled past either end.
const rubber = (h: number, s: Snaps) =>
  h > s.max ? s.max + Math.min(80, (h - s.max) * 0.35)
  : h < s.slim ? s.slim - Math.min(16, (s.slim - h) * 0.3)
  : h;

const nearest = (h: number, s: Snaps) =>
  ORDER.reduce((a, m) => (Math.abs(s[m] - h) < Math.abs(s[a] - h) ? m : a), 'normal' as Mode);

export default function Banner({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [snaps, setSnaps] = useState<Snaps>({ slim: 66, normal: 250, max: 420 });
  const [mode, setMode] = useState<Mode>('normal');
  const [h, setH] = useState(250);
  const [dragging, setDragging] = useState(false);

  const hRef = useRef(250);
  const modeRef = useRef<Mode>('normal');
  const snapsRef = useRef(snaps);
  const spring = useRef({ raf: 0, v: 0 });
  const drag = useRef({ id: -1, y: 0, h: 0, moved: false, t: 0, v: 0, lastY: 0 });
  const wheelLock = useRef(0);

  const setHeight = (v: number) => { hRef.current = v; setH(v); };

  // Spring animation: settles with a slight elastic overshoot.
  const animateTo = useCallback((target: number, velocity = 0) => {
    cancelAnimationFrame(spring.current.raf);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setHeight(target); return; }
    spring.current.v = velocity;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const x = hRef.current;
      const a = 210 * (target - x) - 17 * spring.current.v;
      spring.current.v += a * dt;
      const next = x + spring.current.v * dt;
      if (Math.abs(target - next) < 0.4 && Math.abs(spring.current.v) < 4) { setHeight(target); return; }
      setHeight(next);
      spring.current.raf = requestAnimationFrame(tick);
    };
    spring.current.raf = requestAnimationFrame(tick);
  }, []);

  const snapTo = useCallback((m: Mode, velocity = 0) => {
    modeRef.current = m;
    setMode(m);
    animateTo(snapsRef.current[m], velocity);
  }, [animateTo]);

  const step = useCallback((dir: 1 | -1) => {
    snapTo(ORDER[clamp(ORDER.indexOf(modeRef.current) + dir, 0, 2)]);
  }, [snapTo]);

  // Measure on load and on resize, keeping the current size mode.
  useLayoutEffect(() => {
    const update = () => {
      const s = measure();
      snapsRef.current = s;
      setSnaps(s);
      if (drag.current.id === -1) { cancelAnimationFrame(spring.current.raf); setHeight(s[modeRef.current]); }
    };
    update();
    const t = setTimeout(update, 80); // once the carousel has its real height
    window.addEventListener('resize', update);
    return () => { clearTimeout(t); window.removeEventListener('resize', update); cancelAnimationFrame(spring.current.raf); };
  }, []);

  // ---- Pull down / swipe up (tracked on the window, so dragging below the banner still works) ----
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(spring.current.raf);
    const now = performance.now();
    drag.current = { id: e.pointerId, y: e.clientY, h: hRef.current, moved: false, t: now, v: 0, lastY: e.clientY };

    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (d.id !== ev.pointerId) return;
      const dy = ev.clientY - d.y;
      if (!d.moved) {
        if (Math.abs(dy) < 6) return;
        d.moved = true;
        setDragging(true);
      }
      ev.preventDefault();
      const t = performance.now();
      d.v = 0.7 * d.v + 0.3 * ((ev.clientY - d.lastY) / Math.max(1, t - d.t));
      d.t = t; d.lastY = ev.clientY;
      setHeight(rubber(d.h + dy, snapsRef.current));
    };
    const up = (ev: PointerEvent) => {
      const d = drag.current;
      if (d.id !== ev.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      d.id = -1;
      if (!d.moved) { animateTo(snapsRef.current[modeRef.current]); return; }
      setDragging(false);
      const s = snapsRef.current;
      // A quick flick moves a step in that direction; otherwise settle at the nearest size.
      const target = Math.abs(d.v) > 0.45
        ? ORDER[clamp(ORDER.indexOf(nearest(d.h, s)) + (d.v > 0 ? 1 : -1), 0, 2)]
        : nearest(hRef.current, s);
      snapTo(target, clamp(d.v * 1000, -2500, 2500));
      setTimeout(() => { d.moved = false; }, 0);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };
  // Ignore the click that ends a drag, so buttons don't fire by accident.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); }
  };

  // ---- Mouse wheel / trackpad: scroll down to slim it, scroll up to open it ----
  const wheelStep = useCallback((deltaY: number) => {
    const now = Date.now();
    if (Math.abs(deltaY) < 6 || now < wheelLock.current) return;
    wheelLock.current = now + 480;
    step(deltaY > 0 ? -1 : 1);
  }, [step]);

  useEffect(() => {
    const onWin = (e: WheelEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.deck, .sheet-wrap')) return; // those areas use the wheel themselves
      // Let the chat scroll first; once it reaches its end, the banner responds.
      const thread = t.closest('.thread') as HTMLElement | null;
      if (thread) {
        const atTop = thread.scrollTop <= 1;
        const atEnd = thread.scrollTop + thread.clientHeight >= thread.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return;
      }
      wheelStep(e.deltaY);
    };
    window.addEventListener('wheel', onWin, { passive: true });
    return () => window.removeEventListener('wheel', onWin);
  }, [wheelStep]);

  // Subtle cursor parallax.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let f = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(f);
      f = requestAnimationFrame(() => ref.current?.style.setProperty('--mx', String(e.clientX / window.innerWidth - 0.5)));
    };
    window.addEventListener('pointermove', onMove);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(f); };
  }, []);

  // Progress values decide what shows at each size.
  const compact = snaps.normal - snaps.slim < 170; // short screens get a tighter hero
  const p = clamp((h - snaps.slim) / Math.max(1, snaps.normal - snaps.slim), 0, 1.15);
  const q = clamp((h - snaps.normal) / Math.max(1, snaps.max - snaps.normal), 0, 1.2);

  return (
    <header
      ref={ref}
      className={`banner is-${mode} ${compact ? 'is-compact' : ''} ${dragging ? 'is-dragging' : ''}`}
      style={{ height: h, '--h': `${h}px`, '--p': p, '--q': q } as React.CSSProperties}
      onPointerDown={onDown}
      onClickCapture={onClickCapture}
    >
      <div className="bg" aria-hidden="true" />
      <Network />
      <div className="veil" aria-hidden="true" />

      <nav className="bar" aria-label="Main">
        <a className="brand" href="/" aria-label="Procurism home">
          <Mark className="brand-mark" />
          <span className="brand-text">Procurism<em>Sourcing clarity for a complex world</em></span>
        </a>
        <ul className="menu">
          {menu.map(m => (
            <li key={m.id}>
              <button type="button" className={m.id === 'demo' ? 'is-cta' : ''} onClick={() => onOpen(m.id)}>
                <span className="lg">{m.label}</span><span className="sm">{m.short}</span>
              </button>
            </li>
          ))}
        </ul>
        
      </nav>

      <div className="hero" aria-hidden={p < 0.5}>
        <p className="hero-kicker">Independent procurement platform</p>
        <h1><span>Better sourcing.</span> <span className="h1-alt">Better decisions.</span></h1>
        <p className="hero-sub">Supplier discovery, sourcing workflows, vendor management and procurement intelligence, together in one platform.</p>
        <div className="hero-actions">
          <a className="btn btn-mint" href={company.demoUrl} target="_blank" rel="noopener noreferrer" tabIndex={p < 0.5 ? -1 : 0}>
            Book a demo <span aria-hidden="true">→</span>
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => onOpen('how')} tabIndex={p < 0.5 ? -1 : 0}>How it works</button>
        </div>
      </div>

      <div className="chevs" aria-hidden="true">
        <i className="c1"><span>Requirements</span></i>
        <i className="c2"><span>Supplier engagement</span></i>
        <i className="c3"><span>Evaluation &amp; decision</span></i>
      </div>

      <button
        type="button"
        className="grip"
        aria-label={mode === 'max' ? 'Shrink banner' : 'Expand banner'}
        title="Pull down to expand, push up to slim"
        onClick={() => step(mode === 'max' ? -1 : 1)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
        }}
      >
        <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M6 8l6-4 6 4" /></svg>
      </button>
    </header>
  );
}
