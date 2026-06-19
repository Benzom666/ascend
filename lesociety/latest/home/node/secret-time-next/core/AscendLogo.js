import React from "react";

/**
 * Animated Ascend brand lockup for the landing navbar.
 * Bold "A" mark + ASCEND wordmark, with white particles drifting upward
 * (an "ascending" motion) and a soft glow. Pure inline SVG + CSS — no deps.
 */

// particles scattered around the mark; each rises and twinkles on its own loop.
// balanced left/right with a few above the apex to emphasise the upward motion.
const PARTICLES = [
  { x: 140, y: 14, s: 4, d: 0.6, t: 6.2, o: 0.85 }, // above apex
  { x: 118, y: 30, s: 3, d: 2.4, t: 6.8, o: 0.65 },
  { x: 164, y: 30, s: 3, d: 1.1, t: 7.0, o: 0.7 },
  { x: 52, y: 80, s: 4, d: 0.0, t: 5.8, o: 0.8 }, // left exterior
  { x: 66, y: 132, s: 3, d: 3.1, t: 6.4, o: 0.7 },
  { x: 36, y: 150, s: 2, d: 4.6, t: 7.2, o: 0.55 },
  { x: 208, y: 70, s: 4, d: 3.6, t: 5.9, o: 0.85 }, // right exterior
  { x: 224, y: 116, s: 3, d: 1.8, t: 6.6, o: 0.7 },
  { x: 236, y: 152, s: 2, d: 5.0, t: 7.0, o: 0.55 },
  { x: 150, y: 152, s: 3, d: 2.0, t: 5.5, o: 0.7 }, // base center
  { x: 200, y: 150, s: 3, d: 4.2, t: 6.2, o: 0.65 },
  { x: 188, y: 116, s: 2, d: 0.4, t: 7.4, o: 0.55 },
];

export default function AscendLogo({ width = 250 }) {
  return (
    <div
      className="ascend-logo"
      style={{ width: "100%", maxWidth: width, margin: "0 auto" }}
    >
      <svg viewBox="0 0 280 250" role="img" aria-label="Ascend" width="100%">
        <defs>
          <radialGradient id="ascendGlow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ascendInk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dfe3ea" />
          </linearGradient>
        </defs>

        <style>{`
          .ascend-logo svg { overflow: visible; }
          @keyframes ascRise {
            0%   { opacity: 0; transform: translateY(12px); }
            18%  { opacity: 1; }
            72%  { opacity: 0.5; }
            100% { opacity: 0; transform: translateY(-78px); }
          }
          @keyframes ascGlow {
            0%,100% { opacity: 0.22; transform: scale(1); }
            50%     { opacity: 0.45; transform: scale(1.07); }
          }
          @keyframes ascMarkIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ascFloat {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-3px); }
          }
          @keyframes ascWordIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .asc-glow  { transform-box: fill-box; transform-origin: center;
                       animation: ascGlow 4.5s ease-in-out infinite; }
          .asc-p     { fill: #fff; transform-box: fill-box; transform-origin: center;
                       animation-name: ascRise; animation-timing-function: ease-in-out;
                       animation-iteration-count: infinite; will-change: transform, opacity; }
          .asc-markInner { transform-box: fill-box; transform-origin: center;
                       animation: ascFloat 6s ease-in-out 0.9s infinite; }
          .asc-mark  { transform-box: fill-box; transform-origin: center bottom;
                       animation: ascMarkIn 0.9s cubic-bezier(.2,.7,.2,1) both; }
          .asc-word  { fill: #fff; font-family: "Montserrat", "Helvetica Neue", Arial, sans-serif;
                       font-weight: 400; font-size: 34px; letter-spacing: 12px;
                       text-anchor: middle; transform-box: fill-box; transform-origin: center;
                       animation: ascWordIn 0.8s ease-out 0.45s both; }
          @media (prefers-reduced-motion: reduce) {
            .asc-glow, .asc-p, .asc-markInner, .asc-mark, .asc-word { animation: none !important; opacity: 1 !important; }
          }
        `}</style>

        {/* soft glow behind the mark */}
        <ellipse className="asc-glow" cx="140" cy="92" rx="96" ry="82" fill="url(#ascendGlow)" />

        {/* rising particles */}
        <g>
          {PARTICLES.map((p, i) => (
            <rect
              key={i}
              className="asc-p"
              x={p.x}
              y={p.y}
              width={p.s}
              height={p.s}
              style={{
                animationDelay: `${p.d}s`,
                animationDuration: `${p.t}s`,
                opacity: p.o,
              }}
            />
          ))}
        </g>

        {/* the A mark — positioning (attribute transform) and animation (CSS transform)
            are kept on SEPARATE nested groups so CSS never clobbers the translate/scale */}
        <g className="asc-mark">
          <g transform="translate(80,22) scale(1.2)">
            <g className="asc-markInner">
              <path
                fill="url(#ascendInk)"
                fillRule="evenodd"
                d="M50 6 L92 94 L8 94 Z M50 34 L61 58 L39 58 Z M50 66 L67 94 L33 94 Z"
              />
            </g>
          </g>
        </g>

        {/* ASCEND wordmark (extra leading space offsets the letter-spacing for true centering) */}
        <text className="asc-word" x="146" y="212">
          ASCEND
        </text>
      </svg>
    </div>
  );
}
