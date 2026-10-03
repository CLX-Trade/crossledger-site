// Hero illustration: a shipping route across a dotted world, with the three
// things CrossLedger records along the way (a registered document, an
// inspection attestation, an escrow release). Drawn in SVG with theme tokens so
// it renders correctly in light and dark mode and stays sharp at any size.

const DOTS = (() => {
  // Coarse dotted-continent mask on a 40 x 18 grid (1 = land).
  const rows = [
    "0000000000000000000000000000000000000000",
    "0000011111100000000001111111111111000000",
    "0001111111111000000111111111111111111000",
    "0011111111111000001111111111111111111100",
    "0001111111110000011111111111111111111100",
    "0000111111100000011111111111111111111000",
    "0000011111000000001111111111111111110000",
    "0000001111000000000111111111111111100000",
    "0000000111100000000111111110111111000000",
    "0000000011110000000011111100011110000000",
    "0000000011111000000011111000001100000000",
    "0000000001111100000001111000000110000000",
    "0000000001111100000001111000000011100000",
    "0000000000111100000000110000000111110000",
    "0000000000111000000000110000000111111000",
    "0000000000110000000000000000000011110000",
    "0000000000100000000000000000000000000000",
    "0000000000000000000000000000000000000000",
  ];
  const pts = [];
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "1") pts.push([30 + x * 13, 40 + y * 13]); }));
  return pts;
})();

export default function HeroArt() {
  return (
    <svg viewBox="0 0 580 440" role="img" aria-label="A cargo route between continents with a registered document, an inspection attestation and an escrow release recorded along it" style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="hg-route" x1="0" x2="1">
          <stop offset="0" stopColor="#3355ff" />
          <stop offset="1" stopColor="#7b5cff" />
        </linearGradient>
        <filter id="hg-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#121317" floodOpacity="0.14" />
        </filter>
      </defs>

      <rect x="0" y="0" width="580" height="440" rx="24" fill="var(--bg-raised)" stroke="var(--border)" />
      <g fill="var(--border-strong)">
        {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" />)}
      </g>

      <path d="M470 236 C 430 150, 330 110, 262 120" fill="none" stroke="url(#hg-route)" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M262 120 C 210 128, 160 160, 132 112" fill="none" stroke="url(#hg-route)" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity=".55" />
      <circle cx="470" cy="236" r="7" fill="var(--primary)" />
      <circle cx="470" cy="236" r="14" fill="none" stroke="var(--primary)" strokeOpacity=".35" strokeWidth="2" />
      <circle cx="262" cy="120" r="6" fill="var(--violet)" />
      <circle cx="132" cy="112" r="5" fill="var(--violet)" opacity=".6" />

      <g filter="url(#hg-shadow)">
        <rect x="300" y="262" width="236" height="96" rx="14" fill="var(--bg-raised)" stroke="var(--border)" />
      </g>
      <rect x="316" y="278" width="34" height="42" rx="6" fill="var(--primary-soft)" />
      <path d="M324 290h18M324 298h18M324 306h12" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" />
      <text x="362" y="292" fontSize="13" fontWeight="700" fill="var(--text)" fontFamily="Inter, sans-serif">Bill of lading registered</text>
      <text x="362" y="311" fontSize="11.5" fill="var(--text-dim)" fontFamily="JetBrains Mono, monospace">sha256 0x9f3c…a71e</text>
      <rect x="316" y="330" width="98" height="18" rx="9" fill="var(--ok-soft)" />
      <text x="365" y="343" fontSize="10.5" fontWeight="700" fill="var(--ok)" textAnchor="middle" fontFamily="Inter, sans-serif">UNIQUE · VERIFIED</text>

      <g filter="url(#hg-shadow)">
        <rect x="40" y="250" width="226" height="86" rx="14" fill="var(--bg-raised)" stroke="var(--border)" />
      </g>
      <circle cx="74" cy="282" r="17" fill="var(--primary-soft)" />
      <path d="M66 282l6 6 11-12" fill="none" stroke="var(--primary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="102" y="279" fontSize="13" fontWeight="700" fill="var(--text)" fontFamily="Inter, sans-serif">Inspection signed</text>
      <text x="102" y="297" fontSize="11.5" fill="var(--text-dim)" fontFamily="Inter, sans-serif">30,000 MT · EN590 · in spec</text>
      <rect x="58" y="310" width="190" height="6" rx="3" fill="var(--bg-soft)" />
      <rect x="58" y="310" width="172" height="6" rx="3" fill="url(#hg-route)" />

      <g filter="url(#hg-shadow)">
        <rect x="330" y="36" width="210" height="80" rx="14" fill="var(--bg-raised)" stroke="var(--border)" />
      </g>
      <rect x="346" y="52" width="40" height="40" rx="10" fill="url(#hg-route)" />
      <path d="M359 70v-4a7 7 0 0 1 14 0" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="356" y="70" width="20" height="14" rx="3" fill="#fff" />
      <text x="398" y="68" fontSize="13" fontWeight="700" fill="var(--text)" fontFamily="Inter, sans-serif">Escrow released</text>
      <text x="398" y="87" fontSize="11.5" fill="var(--text-dim)" fontFamily="Inter, sans-serif">USDT to seller, on proof</text>
    </svg>
  );
}
