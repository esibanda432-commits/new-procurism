import type { PanelId } from '../data/content';

// Line icons for each Procurism option.
const paths: Record<PanelId, string> = {
  discovery: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M15.2 15.2L20 20',
  workflows: 'M4 6h6v4H4z M14 14h6v4h-6z M7 10v3a2 2 0 0 0 2 2h5 M17 14V9a2 2 0 0 0-2-2h-5',
  vendors: 'M3 20V9l9-5 9 5v11 M7 20v-6h10v6 M3 20h18',
  intelligence: 'M4 20V4 M4 20h16 M8 16l4-5 3 3 5-7',
  how: 'M4 12h4 M10 12h4 M16 12h4 M8 9l3 3-3 3 M14 9l3 3-3 3',
  who: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20a6 6 0 0 1 12 0 M16 6a3 3 0 0 1 0 6 M17 14a5 5 0 0 1 4 6',
  about: 'M12 3l9 9-9 9-9-9z M12 8v8',
  demo: 'M5 4l14 8-14 8z',
};

export default function Icon({ id }: { id: PanelId }) {
  return (
    <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[id]} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
