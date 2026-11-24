// Industrial skyline (refinery, tanks, stacks, pipe racks) drawn as vector shapes in the Procurism palette.
// Echoes the "industrial scale" photography direction without relying on raster images.
export function SkylineShapes({ y = 320 }: { y?: number }) {
  const b = y;
  return (
    <g className="skyline">
      <g fill="#0b4650" opacity=".85">
        <rect x="0" y={b - 70} width="60" height="70" />
        <rect x="14" y={b - 118} width="12" height="48" />
        <rect x="116" y={b - 84} width="26" height="84" />
        <rect x="122" y={b - 112} width="14" height="28" />
        <rect x="316" y={b - 92} width="22" height="92" />
        <rect x="350" y={b - 64} width="50" height="64" rx="4" />
        <rect x="560" y={b - 100} width="18" height="100" />
        <rect x="590" y={b - 74} width="60" height="74" />
        <rect x="660" y={b - 90} width="60" height="90" />
      </g>
      <g fill="#06303a">
        <rect x="18" y={b - 130} width="8" height="130" />
        <rect x="34" y={b - 96} width="6" height="96" />
        <rect x="6" y={b - 42} width="84" height="42" rx="2" />
        <ellipse cx="48" cy={b - 42} rx="42" ry="7" />
        <rect x="168" y={b - 140} width="4" height="140" />
        <rect x="200" y={b - 108} width="24" height="108" rx="3" />
        <rect x="196" y={b - 80} width="32" height="4" /><rect x="196" y={b - 54} width="32" height="4" />
        <rect x="236" y={b - 46} width="190" height="5" />
        <rect x="244" y={b - 46} width="4" height="46" /><rect x="300" y={b - 46} width="4" height="46" /><rect x="356" y={b - 46} width="4" height="46" /><rect x="412" y={b - 46} width="4" height="46" />
        <rect x="258" y={b - 40} width="46" height="40" rx="3" /><ellipse cx="281" cy={b - 40} rx="23" ry="5" />
        <rect x="440" y={b - 126} width="14" height="126" /><rect x="462" y={b - 100} width="10" height="100" />
        <rect x="492" y={b - 148} width="8" height="148" />
        <rect x="520" y={b - 52} width="70" height="52" rx="3" /><ellipse cx="555" cy={b - 52} rx="35" ry="6" />
        <path d={`M610 ${b} L622 ${b - 124} L634 ${b} M614 ${b - 80} H630 M618 ${b - 40} H626`} stroke="#06303a" strokeWidth="3" fill="none" />
        <rect x="660" y={b - 56} width="60" height="56" rx="3" /><ellipse cx="690" cy={b - 56} rx="30" ry="6" />
        <rect x="0" y={b - 6} width="720" height="6" />
      </g>
      <circle cx="170" cy={b - 150} r="6" fill="#d1aa99" /><circle cx="170" cy={b - 150} r="12" fill="#a1814b" opacity=".35" />
      <circle cx="496" cy={b - 154} r="4" fill="#d1aa99" />
    </g>
  );
}

export default function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg className={`skyline-svg ${className}`} viewBox="0 0 720 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="dusk" cx=".7" cy="1" r=".9">
          <stop offset="0" stopColor="#d1aa99" stopOpacity=".75" />
          <stop offset=".45" stopColor="#a1814b" stopOpacity=".4" />
          <stop offset="1" stopColor="#a1814b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="720" height="170" fill="url(#dusk)" />
      <SkylineShapes y={170} />
    </svg>
  );
}
