import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Home.module.css'

function RulesModal({ onClose }) {
  return (
    <motion.div
      className={styles.rulesOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.rulesModal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="How to Play"
      >
        <h2 className={styles.rulesTitle}>How to Play</h2>

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesSectionTitle}>Overview</h3>
          <p className={styles.rulesText}>
            Scotland Yard is an asymmetric board game set in London. One player
            takes the role of Mr. X, a fugitive trying to evade capture.
            The remaining players are detectives working together to corner
            and catch Mr. X before he escapes.
          </p>
        </div>

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesSectionTitle}>Movement</h3>
          <p className={styles.rulesText}>
            Players move between numbered stations using transport tickets:
            Taxi (short hops), Bus (medium range), and Underground (long range).
            Each move costs one ticket of the chosen transport type.
            Ferry routes connect a few special stations for free.
          </p>
        </div>

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesSectionTitle}>Mr. X</h3>
          <p className={styles.rulesText}>
            Mr. X moves secretly. Only the type of ticket used is shown each turn.
            On reveal turns (3, 8, 13, 18, 24), Mr. X&apos;s position is
            revealed to all detectives. Mr. X has special Black Tickets
            (hide transport type) and Double Move tokens.
          </p>
        </div>

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesSectionTitle}>Winning</h3>
          <p className={styles.rulesText}>
            Detectives win by moving onto Mr. X&apos;s station. Mr. X wins by
            surviving all 24 turns without being caught. If all detectives
            run out of valid moves, Mr. X also wins.
          </p>
        </div>

        <div className={styles.rulesSection}>
          <h3 className={styles.rulesSectionTitle}>Local Hot-Seat</h3>
          <p className={styles.rulesText}>
            In local mode, players pass the device between turns. A screen
            blocks the view during handoff so the next player cannot see
            the previous player&apos;s information.
          </p>
        </div>

        <button className={styles.rulesClose} onClick={onClose}>
          Got It
        </button>
      </motion.div>
    </motion.div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.12, duration: 0.45, ease: 'easeOut' },
  }),
}

function Home() {
  const navigate = useNavigate()
  const [showRules, setShowRules] = useState(false)

  const handleLocalGame = useCallback(() => {
    navigate('/setup')
  }, [navigate])

  const handleOnlineGame = useCallback(() => {
    navigate('/lobby/online')
  }, [navigate])

  const handleShowRules = useCallback(() => {
    setShowRules(true)
  }, [])

  const handleCloseRules = useCallback(() => {
    setShowRules(false)
  }, [])

  return (
    <div className={styles.homePage}>
      <div className={styles.homeBackground}>
        <div className={styles.gridOverlay} />
      </div>

      <div className={styles.homeContent}>
        <motion.h1
          className={styles.homeTitle}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Scotland Yard
        </motion.h1>

        <motion.p
          className={styles.homeSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          A game of cat and mouse across London
        </motion.p>

        <div className={styles.optionCards}>
          <motion.button
            className={`${styles.optionCard} ${styles.optionCardLocal}`}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLocalGame}
          >
            <span className={styles.optionCardIcon} aria-hidden="true">
              {'<>'}
            </span>
            <span className={styles.optionCardBody}>
              <span className={styles.optionCardTitle}>Local Game</span>
              <span className={styles.optionCardDescription}>
                Hot-seat multiplayer on one device
              </span>
            </span>
            <span className={styles.optionCardArrow} aria-hidden="true">
              {'\u2192'}
            </span>
          </motion.button>

          <motion.button
            className={`${styles.optionCard} ${styles.optionCardOnline}`}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOnlineGame}
          >
            <span className={styles.optionCardIcon} aria-hidden="true">
              {'::'}
            </span>
            <span className={styles.optionCardBody}>
              <span className={styles.optionCardTitle}>Online Game</span>
              <span className={styles.optionCardDescription}>
                Play with friends remotely
              </span>
            </span>
            <span className={styles.optionCardArrow} aria-hidden="true">
              {'\u2192'}
            </span>
          </motion.button>

          <motion.button
            className={`${styles.optionCard} ${styles.optionCardRules}`}
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShowRules}
          >
            <span className={styles.optionCardIcon} aria-hidden="true">
              {'?'}
            </span>
            <span className={styles.optionCardBody}>
              <span className={styles.optionCardTitle}>How to Play</span>
              <span className={styles.optionCardDescription}>
                Learn the rules of Scotland Yard
              </span>
            </span>
            <span className={styles.optionCardArrow} aria-hidden="true">
              {'\u2192'}
            </span>
          </motion.button>
        </div>
      </div>

      <span className={styles.homeFooter}>Scotland Yard Board Game</span>

      <AnimatePresence>
        {showRules && <RulesModal onClose={handleCloseRules} />}
      </AnimatePresence>
    </div>
  )
}

export default Home
