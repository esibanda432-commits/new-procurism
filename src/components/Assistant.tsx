import { useEffect, useRef, useState, type FormEvent } from 'react';
import { aiReply, greeting, localReply, suggestions, type Action, type Reply } from '../data/assistant';
import { flow, type PanelId } from '../data/content';
import Mark from './Mark';
import Icon from './Icon';

interface Msg { id: number; role: 'user' | 'assistant'; text: string; actions?: Action[]; typing?: boolean }

let nextId = 1;

export default function Assistant({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [step, setStep] = useState<string | null>(null); // highlighted flow stage
  const listRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const tour = useRef<number[]>([]);

  // Light each stage in turn, then settle on all four.
  const playTour = () => {
    tour.current.forEach(clearTimeout);
    tour.current = flow.map((f, i) => window.setTimeout(() => setStep(f.key), 250 + i * 650));
    tour.current.push(window.setTimeout(() => setStep('all'), 250 + flow.length * 650));
  };

  // Reveal assistant replies word by word.
  const say = (reply: Reply) => {
    const id = nextId++;
    const words = reply.text.split(' ');
    if (reply.step === 'all') playTour();
    else if (reply.step) { tour.current.forEach(clearTimeout); setStep(reply.step); }
    setMsgs(m => [...m, { id, role: 'assistant', text: '', typing: true }]);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setMsgs(m => m.map(x => (x.id === id ? { ...x, text: words.slice(0, i).join(' ') } : x)));
      if (i >= words.length) {
        clearInterval(timer);
        setMsgs(m => m.map(x => (x.id === id ? { ...x, typing: false, actions: reply.actions } : x)));
      }
    }, 26);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t = setTimeout(() => say(greeting), 900);
    return () => { clearTimeout(t); tour.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, thinking]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput('');
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant')?.text;
    const history = [...msgs, { role: 'user' as const, text: q }].map(m => ({ role: m.role, content: m.text }));
    setMsgs(m => [...m, { id: nextId++, role: 'user', text: q }]);
    setThinking(true);

    const local = localReply(q, lastAssistant);
    const [ai] = await Promise.all([aiReply(history), new Promise(r => setTimeout(r, 600))]);
    setThinking(false);
    say(ai ? { text: ai, actions: local.actions, step: local.step } : local);
  };

  const act = (a: Action) => {
    if (a.panel) onOpen(a.panel);
    else if (a.href) window.open(a.href, a.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
    else ask(a.label);
  };

  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };
  const busy = thinking || msgs.some(m => m.typing);
  const activeIndex = flow.findIndex(f => f.key === step);

  return (
    <section className="desk" aria-label="Ask Procurism">
      {/* Sourcing flow rail */}
      <ol className={`flow ${step === 'all' ? 'is-all' : ''}`} aria-label="Sourcing flow">
        {flow.map((f, i) => (
          <li key={f.key} className={step === 'all' || i === activeIndex ? 'is-on' : i < activeIndex ? 'is-past' : ''}>
            <button type="button" onClick={() => onOpen(f.panel)}>
              <span className="flow-node" aria-hidden="true"><Icon id={f.panel} /></span>
              <span className="flow-n">0{i + 1}</span>
              <span className="flow-label">{f.label}</span>
            </button>
          </li>
        ))}
        <span className="flow-pulse" aria-hidden="true" style={{ '--i': Math.max(0, activeIndex) } as React.CSSProperties} />
      </ol>

      <div className="desk-chat">
        <div className="desk-head">
          <span className={`desk-mark ${busy ? 'is-busy' : ''}`} aria-hidden="true"><Mark animate={false} /></span>
          <div>
            <p className="desk-title">Ask Procurism</p>
            <p className="desk-status">{thinking ? 'Checking…' : 'Your sourcing questions, answered'}</p>
          </div>
        </div>

        <div className="thread" ref={listRef} aria-live="polite">
          {msgs.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              <p>{m.text}{m.typing && <span className="caret" />}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="msg-actions">
                  {m.actions.map(a => (
                    <button key={a.label} type="button" onClick={() => act(a)}>{a.label}<span aria-hidden="true">→</span></button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {thinking && <div className="msg assistant"><p className="dots"><i /><i /><i /></p></div>}
        </div>

        <div className="suggestions" aria-label="Suggested questions">
          {suggestions.map(s => (
            <button key={s} type="button" onClick={() => ask(s)} disabled={busy}>{s}</button>
          ))}
        </div>

        <form className="ask" onSubmit={submit}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about suppliers, workflows, demos…"
            aria-label="Your question"
            maxLength={500}
          />
          <button type="submit" disabled={!input.trim() || busy} aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>
    </section>
  );
}
