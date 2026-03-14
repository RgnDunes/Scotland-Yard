import React from 'react'

/**
 * SVG background layer that adds geographic context to the board:
 * Thames River, parks, district labels, and faint street grid.
 * Rendered as the bottom layer in the map SVG.
 */
function MapBackground() {
  return (
    <g className="map-background" aria-hidden="true">
      {/* Faint street grid lines */}
      <g opacity={0.08} stroke="#8b7355" strokeWidth={1}>
        {/* Horizontal streets */}
        <line x1={30} y1={200} x2={1610} y2={200} />
        <line x1={30} y1={400} x2={1610} y2={400} />
        <line x1={30} y1={600} x2={1610} y2={600} />
        <line x1={30} y1={800} x2={1610} y2={800} />
        <line x1={30} y1={1000} x2={1610} y2={1000} />
        {/* Vertical streets */}
        <line x1={200} y1={10} x2={200} y2={1220} />
        <line x1={500} y1={10} x2={500} y2={1220} />
        <line x1={800} y1={10} x2={800} y2={1220} />
        <line x1={1100} y1={10} x2={1100} y2={1220} />
        <line x1={1400} y1={10} x2={1400} y2={1220} />
      </g>

      {/* Parks / green areas */}
      <ellipse cx={420} cy={180} rx={120} ry={60} fill="#4caf50" opacity={0.1} />
      <text x={420} y={185} textAnchor="middle" fontSize={18} fill="#4caf50" opacity={0.2} fontStyle="italic">
        Regent&apos;s Park
      </text>

      <ellipse cx={350} cy={500} rx={100} ry={70} fill="#4caf50" opacity={0.1} />
      <text x={350} y={505} textAnchor="middle" fontSize={16} fill="#4caf50" opacity={0.2} fontStyle="italic">
        Hyde Park
      </text>

      <ellipse cx={680} cy={700} rx={60} ry={40} fill="#4caf50" opacity={0.08} />

      <ellipse cx={250} cy={810} rx={70} ry={40} fill="#4caf50" opacity={0.08} />

      {/* Thames River */}
      <path
        d={`
          M 0 720
          C 100 700, 200 740, 350 760
          C 500 780, 600 810, 700 830
          C 800 850, 850 870, 950 890
          C 1050 910, 1100 900, 1200 880
          C 1300 860, 1350 870, 1450 900
          C 1500 910, 1550 920, 1640 930
          L 1640 980
          C 1550 960, 1500 950, 1450 940
          C 1350 920, 1300 910, 1200 930
          C 1100 950, 1050 960, 950 940
          C 850 920, 800 900, 700 880
          C 600 860, 500 830, 350 810
          C 200 790, 100 750, 0 770
          Z
        `}
        fill="#4a90c4"
        opacity={0.18}
      />
      <text x={820} y={905} textAnchor="middle" fontSize={22} fill="#4a90c4" opacity={0.25} fontStyle="italic" fontWeight={600}>
        River Thames
      </text>

      {/* District labels */}
      <g fontSize={24} fontWeight={700} opacity={0.12} fill="#5c4a32" fontFamily="serif">
        <text x={140} y={300} textAnchor="middle">Paddington</text>
        <text x={500} y={130} textAnchor="middle">Marylebone</text>
        <text x={900} y={60} textAnchor="middle">Euston</text>
        <text x={1300} y={60} textAnchor="middle">King&apos;s Cross</text>
        <text x={600} y={420} textAnchor="middle">Soho</text>
        <text x={1000} y={330} textAnchor="middle">The City</text>
        <text x={1450} y={320} textAnchor="middle">Whitechapel</text>
        <text x={300} y={700} textAnchor="middle">Westminster</text>
        <text x={800} y={620} textAnchor="middle">Southwark</text>
        <text x={1200} y={550} textAnchor="middle">Tower</text>
        <text x={500} y={950} textAnchor="middle">Lambeth</text>
        <text x={1000} y={780} textAnchor="middle">Bermondsey</text>
      </g>
    </g>
  )
}

export default React.memo(MapBackground)
