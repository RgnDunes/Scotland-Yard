import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import styles from './Tickets.module.css'

const TRANSPORT_LABELS = {
  taxi: 'Taxi',
  bus: 'Bus',
  underground: 'Underground',
  ferry: 'Ferry',
  black: 'Black',
  double: 'Double',
}

const TRANSPORT_ICONS = {
  taxi: '\u{1F695}',
  bus: '\u{1F68C}',
  underground: '\u{1F687}',
  ferry: '\u{26F4}\uFE0F',
  black: '\u{1F0CF}',
  double: '\u{1F500}',
}

function Ticket({ transport, count, disabled, onClick }) {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick(transport)
    }
  }, [disabled, onClick, transport])

  const label = TRANSPORT_LABELS[transport] ?? transport
  const icon = TRANSPORT_ICONS[transport] ?? ''

  const colorClass = styles[`ticket${label}`] ?? ''
  const disabledClass = disabled ? styles.ticketDisabled : ''

  return (
    <motion.button
      className={`${styles.ticket} ${colorClass} ${disabledClass}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      aria-label={`${label} ticket: ${count} remaining`}
    >
      <span className={styles.ticketIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.ticketLabel}>{label}</span>
      <span className={styles.ticketCount}>{count}</span>
    </motion.button>
  )
}

export default memo(Ticket)
