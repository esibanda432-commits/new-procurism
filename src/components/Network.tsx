import Mark from './Mark';
import { SkylineShapes } from './Skyline';

// Animated supply network: supplier routes flow into the Procurism hub,
// with packets travelling along each route over a container-yard skyline.
const HUB = { x: 250, y: 150 };

const nodes = [
  { id: 'n1', x: 560, y: 58, label: 'Supplier discovery', main: true },
  { id: 'n2', x: 664, y: 128, label: 'Sourcing workflows', main: true },
  { id: 'n3', x: 600, y: 214, label: 'Vendor management', main: true },
  { id: 'n4', x: 452, y: 252, label: 'Procurement intelligence', main: true },
  { id: 'n5', x: 470, y: 30 },
  { id: 'n6', x: 700, y: 52 },
  { id: 'n7', x: 706, y: 214 },
  { id: 'n8', x: 66, y: 72 },
  { id: 'n9', x: 40, y: 206 },
];

// Curved route from a node into the hub.
const route = (n: { x: number; y: number }) => {
  const mx = (n.x + HUB.x) / 2;
  return `M${n.x} ${n.y} C ${mx} ${n.y}, ${mx + (n.x > HUB.x ? -40 : 40)} ${HUB.y}, ${HUB.x + (n.x > HUB.x ? 64 : -64)} ${HUB.y}`;
};

const tones = ['#53bb9b', '#d1aa99', '#a1814b', '#f4ece5'];

// Container stacks: [x, width, rows, accent row index]

export default function Network() {
  return (
    <svg className="net" viewBox="0 0 720 320" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
      <defs>
        <radialGradient id="sun">
          <stop offset="0" stopColor="#d1aa99" stopOpacity=".6" />
          <stop offset=".5" stopColor="#a1814b" stopOpacity=".28" />
          <stop offset="1" stopColor="#a1814b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hubGlow">
          <stop offset="0" stopColor="#53bb9b" stopOpacity=".35" />
          <stop offset="1" stopColor="#53bb9b" stopOpacity="0" />
        </radialGradient>
        {nodes.map(n => <path key={n.id} id={`r-${n.id}`} d={route(n)} />)}
      </defs>

      {/* Golden-hour industrial skyline */}
      <ellipse cx="520" cy="330" rx="300" ry="150" fill="url(#sun)" />
      <SkylineShapes y={320} />

      {/* Routes */}
      <g className="routes">
        {nodes.map(n => <use key={n.id} href={`#r-${n.id}`} className={n.main ? 'route main' : 'route'} />)}
      </g>

      {/* Packets travelling into the hub */}
      <g className="packets">
        {nodes.map((n, i) => (
          <circle key={n.id} r={n.main ? 4 : 3} fill={tones[i % tones.length]}>
            <animateMotion dur={`${3.2 + (i % 4) * 0.7}s`} begin={`${i * 0.45}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#r-${n.id}`} />
            </animateMotion>
          </circle>
        ))}
      </g>

      {/* Supplier nodes */}
      <g className="nodes">
        {nodes.map((n, i) => (
          <g key={n.id} className={n.main ? 'node main' : 'node'} style={{ '--d': `${0.6 + i * 0.1}s` } as React.CSSProperties}>
            <circle cx={n.x} cy={n.y} r={n.main ? 9 : 5} />
            {n.main && <circle className="node-ring" cx={n.x} cy={n.y} r="9" />}
            {n.label && <text x={n.x - 16} y={n.y + 4} textAnchor="end">{n.label}</text>}
          </g>
        ))}
      </g>

      {/* Hub */}
      <g className="hub">
        <circle cx={HUB.x} cy={HUB.y} r="110" fill="url(#hubGlow)" />
        <circle className="hub-ring" cx={HUB.x} cy={HUB.y} r="64" />
        <circle className="hub-ring r2" cx={HUB.x} cy={HUB.y} r="64" />
        <circle cx={HUB.x} cy={HUB.y} r="56" className="hub-disc" />
        <Mark x={HUB.x - 32} y={HUB.y - 46} width="64" height="92" />
      </g>
    </svg>
  );
}
