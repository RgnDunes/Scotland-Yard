import React from 'react'
import styles from './MapLegend.module.css'

const ITEMS = [
  { label: 'Taxi', color: 'var(--transport-taxi)', dash: false },
  { label: 'Bus', color: 'var(--transport-bus)', dash: false },
  { label: 'Underground', color: 'var(--transport-underground)', dash: false },
  { label: 'Ferry', color: 'var(--transport-ferry)', dash: true },
]

function MapLegend() {
  return (
    <div className={styles.legend}>
      {ITEMS.map((item) => (
        <div key={item.label} className={styles.item}>
          <svg width={24} height={10} aria-hidden="true">
            <line
              x1={0}
              y1={5}
              x2={24}
              y2={5}
              stroke={item.color}
              strokeWidth={item.dash ? 3 : item.label === 'Taxi' ? 2 : 3.5}
              strokeDasharray={item.dash ? '4 2' : undefined}
            />
          </svg>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default React.memo(MapLegend)
