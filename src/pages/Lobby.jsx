import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Lobby.module.css'

function Lobby() {
  const navigate = useNavigate()
  const { code } = useParams()

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className={styles.lobbyPage}>
      <motion.div
        className={styles.lobbyContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.lobbyTitle}>Online Lobby</h1>

        {code && (
          <span className={styles.lobbyBadge}>Room: {code}</span>
        )}

        <p className={styles.lobbyText}>
          Online multiplayer is coming soon. For now, gather your friends
          around a single device and enjoy a local hot-seat game.
        </p>

        <motion.button
          className={styles.lobbyBackButton}
          onClick={handleBack}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  )
}

export default Lobby
