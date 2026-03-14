import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import styles from './Setup.module.css'

const MIN_PLAYERS = 3
const MAX_PLAYERS = 6

const DETECTIVE_COLORS = [
  'var(--mrx-accent)',
  'var(--detective-1)',
  'var(--detective-2)',
  'var(--detective-3)',
  'var(--detective-4)',
  'var(--detective-5)',
]

const DEFAULT_NAMES = [
  'Mr. X',
  'Detective Red',
  'Detective Blue',
  'Detective Green',
  'Detective Orange',
  'Detective Purple',
]

function Setup() {
  const navigate = useNavigate()
  const initLocalGame = useGameStore((s) => s.initLocalGame)

  const [playerCount, setPlayerCount] = useState(3)
  const [names, setNames] = useState(() =>
    Array.from({ length: MAX_PLAYERS }, (_, i) => DEFAULT_NAMES[i]),
  )
  const [mrxIndex, setMrxIndex] = useState(0)
  const [mrxIsAi, setMrxIsAi] = useState(false)
  const [mrxDifficulty, setMrxDifficulty] = useState('medium')
  const [error, setError] = useState(null)

  const handleCountChange = useCallback(
    (count) => {
      setPlayerCount(count)
      if (mrxIndex >= count) {
        setMrxIndex(0)
      }
      setError(null)
    },
    [mrxIndex],
  )

  const handleNameChange = useCallback((index, value) => {
    setNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setError(null)
  }, [])

  const handleMrxSelect = useCallback((index) => {
    setMrxIndex(index)
  }, [])

  const handleAiToggle = useCallback(() => {
    setMrxIsAi((prev) => !prev)
  }, [])

  const handleDifficultyChange = useCallback((level) => {
    setMrxDifficulty(level)
  }, [])

  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleStart = useCallback(() => {
    const activeNames = names.slice(0, playerCount)

    /* Validate all names are non-empty */
    const emptyIndex = activeNames.findIndex((n) => !n.trim())
    if (emptyIndex !== -1) {
      setError(`Player ${emptyIndex + 1} needs a name`)
      return
    }

    /* Validate no duplicate names */
    const trimmed = activeNames.map((n) => n.trim().toLowerCase())
    const seen = new Set()
    for (let i = 0; i < trimmed.length; i++) {
      if (seen.has(trimmed[i])) {
        setError(`Duplicate name: "${activeNames[i].trim()}"`)
        return
      }
      seen.add(trimmed[i])
    }

    const finalNames = activeNames.map((n) => n.trim())
    const aiSettings = {
      mrxIsAi,
      mrxDifficulty: mrxIsAi ? mrxDifficulty : 'medium',
    }
    initLocalGame(finalNames, mrxIndex, aiSettings)
    navigate('/game/local')
  }, [names, playerCount, mrxIndex, mrxIsAi, mrxDifficulty, initLocalGame, navigate])

  const activePlayers = names.slice(0, playerCount)

  const isValid =
    activePlayers.every((n) => n.trim().length > 0) &&
    new Set(activePlayers.map((n) => n.trim().toLowerCase())).size ===
      playerCount

  return (
    <div className={styles.setupPage}>
      <motion.div
        className={styles.setupContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.setupHeader}>
          <h1 className={styles.setupTitle}>Local Game Setup</h1>
          <p className={styles.setupSubtitle}>
            Configure your game and choose who plays Mr. X
          </p>
        </div>

        {/* Player Count */}
        <div className={styles.setupSection}>
          <label className={styles.setupLabel}>Number of Players</label>
          <div className={styles.countSelector}>
            {Array.from(
              { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
              (_, i) => i + MIN_PLAYERS,
            ).map((count) => (
              <motion.button
                key={count}
                className={`${styles.countButton} ${count === playerCount ? styles.countButtonActive : ''}`}
                onClick={() => handleCountChange(count)}
                whileTap={{ scale: 0.95 }}
              >
                {count}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div className={styles.setupSection}>
          <label className={styles.setupLabel}>Player Names</label>
          <div className={styles.playerInputs}>
            <AnimatePresence>
              {activePlayers.map((name, i) => (
                <motion.div
                  key={i}
                  className={styles.playerInput}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className={styles.playerInputDot}
                    style={{ background: DETECTIVE_COLORS[i] }}
                    aria-hidden="true"
                  />
                  <input
                    className={styles.playerInputField}
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={`Player ${i + 1}`}
                    maxLength={20}
                    autoComplete="off"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Mr. X Selection */}
        <div className={styles.setupSection}>
          <label className={styles.setupLabel}>Who is Mr. X?</label>
          <div className={styles.mrxSelector}>
            {activePlayers.map((name, i) => (
              <motion.button
                key={i}
                className={`${styles.mrxOption} ${mrxIndex === i ? styles.mrxOptionActive : ''}`}
                onClick={() => handleMrxSelect(i)}
                whileTap={{ scale: 0.98 }}
              >
                <span className={styles.mrxRadio} />
                <span className={styles.mrxOptionName}>
                  {name.trim() || `Player ${i + 1}`}
                </span>
                {mrxIndex === i && (
                  <span className={styles.mrxOptionBadge}>Mr. X</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mr. X AI Options */}
        <div className={styles.setupSection}>
          <motion.button
            className={`${styles.aiToggle} ${mrxIsAi ? styles.aiToggleActive : ''}`}
            onClick={handleAiToggle}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className={`${styles.aiCheckbox} ${mrxIsAi ? styles.aiCheckboxChecked : ''}`}
            />
            <span className={styles.aiToggleLabel}>Mr. X is AI controlled</span>
          </motion.button>

          <AnimatePresence>
            {mrxIsAi && (
              <motion.div
                className={styles.aiDifficultySection}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className={styles.setupLabel}>AI Difficulty</label>
                <div className={styles.difficultySelector}>
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      className={`${styles.difficultyButton} ${mrxDifficulty === level ? styles.difficultyButtonActive : ''}`}
                      onClick={() => handleDifficultyChange(level)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <p className={styles.setupError}>{error}</p>}

        {/* Actions */}
        <div className={styles.setupActions}>
          <motion.button
            className={styles.backButton}
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          <motion.button
            className={styles.startButton}
            onClick={handleStart}
            disabled={!isValid}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            Start Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default Setup
