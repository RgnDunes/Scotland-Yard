import { memo } from 'react'
import useGameStore from '../../store/gameStore.js'
import Ticket from './Ticket.jsx'
import styles from './Tickets.module.css'

const DETECTIVE_TRANSPORTS = ['taxi', 'bus', 'underground']
const MRX_TRANSPORTS = ['taxi', 'bus', 'underground', 'black', 'double']

function TicketHand({ playerId }) {
  const player = useGameStore(
    (state) => state.game?.players.find((p) => p.id === playerId) ?? null,
  )

  if (!player) return null

  const transports =
    player.role === 'mrx' ? MRX_TRANSPORTS : DETECTIVE_TRANSPORTS

  return (
    <div className={styles.ticketHand}>
      {transports.map((transport) => (
        <Ticket
          key={transport}
          transport={transport}
          count={player.tickets[transport] ?? 0}
          disabled={player.tickets[transport] <= 0}
        />
      ))}
    </div>
  )
}

export default memo(TicketHand)
