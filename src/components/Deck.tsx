import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { panels, type PanelId } from '../data/content';
import Icon from './Icon';

const N = panels.length;

// Container yard: options are shipping containers on a rail; a cargo tag on a cable
// shows the description of the container in focus (or the one under the cursor).
export default function Deck({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lift, setLift] = useState(0); // restarts the tag animation
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLButtonElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const wheelLock = useRef(0);
  const scrollTimer = useRef(0);

  const cards = () => Array.from(track.current?.querySelectorAll<HTMLElement>('.box-card') ?? []);

  const centreOn = useCallback((i: number, smooth = true) => {
    const el = track.current, c = cards()[i];
    if (!el || !c) return;
    el.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Work out which container is nearest the centre.
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0, dist = Infinity;
    cards().forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    if (best !== active) { setActive(best); setLift(l => l + 1); }
    window.clearTimeout(scrollTimer.current);
    placeTag();
  };

  const go = useCallback((dir: number) => centreOn((active + dir + N) % N), [active, centreOn]);

  // The cargo tag sits above the hovered container, or the selected one,
  // positioned from its real width so it always stays fully on screen.
  const shown = hover ?? active;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const placeTag = useCallback(() => {
    const el = track.current, w = wrap.current, t = tagRef.current, c = cards()[shownRef.current];
    if (!el || !w || !t || !c) return;
    const x = c.offsetLeft - el.scrollLeft + c.offsetWidth / 2;
    const half = t.offsetWidth / 2 + 10;
    const left = Math.min(Math.max(x, half), w.clientWidth - half);
    t.style.left = `${left}px`;
    t.style.setProperty('--cable', `${x - left}px`); // cable still points at the container
  }, []);
  useLayoutEffect(placeTag, [shown, lift, placeTag]);
  useEffect(() => {
    window.addEventListener('resize', placeTag);
    return () => window.removeEventListener('resize', placeTag);
  }, [placeTag]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.querySelector('.sheet-wrap.is-open')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Mouse drag (touch devices swipe natively).
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current, el = track.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; el.classList.add('is-dragging'); }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    track.current?.classList.remove('is-dragging');
    if (d.moved) centreOn(activeRef.current);
    setTimeout(() => { d.moved = false; }, 0);
  };
  const activeRef = useRef(0);
  activeRef.current = active;

  // Mouse wheel / trackpad moves one container at a time.
  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = Date.now();
    if (Math.abs(d) < 8 || now < wheelLock.current) return;
    wheelLock.current = now + 320;
    go(d > 0 ? 1 : -1);
  };

  return (
    <section className="deck" aria-label="Explore Procurism" aria-roledescription="carousel">
      <div className="deck-head">
        <p className="kicker">Explore the platform</p>
        <p className="manifest" aria-live="polite">
          <span>{panels[active].code}</span> · {String(active + 1).padStart(2, '0')}/{String(N).padStart(2, '0')}
        </p>
      </div>

      <div className="yard-wrap" ref={wrap} onWheel={onWheel}>
        <button
          type="button"
          key={`${shown}-${lift}`}
          className={`tag tone-${panels[shown].tone} ${shown === active ? 'is-active' : ''}`}
          ref={tagRef}
          onClick={() => (shown === active ? onOpen(panels[shown].id) : centreOn(shown))}
          onMouseEnter={() => setHover(shown)}
          onMouseLeave={() => setHover(null)}
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="tag-dot" />
          <span className="tag-text">{panels[shown].teaser}</span>
          {shown === active && <span className="tag-open">Open ↑</span>}
          <i className="tag-cable" />
        </button>
        <div
          className="yard-track"
          ref={track}
          onScroll={onScroll}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          {panels.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`box-card tone-${p.tone} ${i === active ? 'is-active' : ''}`}
              aria-label={`${p.label}: ${p.teaser}`}
              onMouseEnter={() => { if (!drag.current.down) setHover(i); }}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => {
                if (drag.current.moved) return;
                if (i === active) onOpen(p.id); else centreOn(i);
              }}
            >
              <span className="box-code">{p.code}</span>
              <span className="box-icon"><Icon id={p.id} /></span>
              <span className="box-label">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="rail" aria-hidden="true" />
      </div>

      <div className="deck-foot">
        <button type="button" className="deck-arrow" onClick={() => go(-1)} aria-label="Previous">←</button>
        <div className="ticks" role="tablist">
          {panels.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={i === active} aria-label={p.label}
              className={i === active ? 'is-on' : ''} onClick={() => centreOn(i)} />
          ))}
        </div>
        <button type="button" className="deck-arrow" onClick={() => go(1)} aria-label="Next">→</button>
      </div>
    </section>
  );
}
