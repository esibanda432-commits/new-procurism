// Procurism mark, rebuilt as vector shapes from the brand document so it stays sharp and can animate.
type Props = { className?: string; animate?: boolean } & Omit<React.SVGProps<SVGSVGElement>, 'className'>;

export default function Mark({ className = '', animate = true, ...rest }: Props) {
  return (
    <svg className={`pmark ${animate ? 'is-animated' : ''} ${className}`} viewBox="118 50 175 248" aria-hidden="true" {...rest}>
      <path className="pm-seg pm-cream" d="M126.9 82.1A87 87 0 0 1 270.2 109.9L234.0 124.5A48 48 0 0 0 155.0 109.2Z" />
      <path className="pm-seg pm-char" d="M270.2 109.9A87 87 0 0 1 252.1 202.9L224.0 175.8A48 48 0 0 0 234.0 124.5Z" />
      <path className="pm-seg pm-bronze" d="M252.1 202.9A87 87 0 0 1 175.9 228.4L182.0 189.9A48 48 0 0 0 224.0 175.8Z" />
      <g className="pm-arrow">
        <rect x="133" y="188" width="42" height="104" />
        <path className="pm-head" d="M153 137 L182 188 L124 188 Z" />
      </g>
    </svg>
  );
}
