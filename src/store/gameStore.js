import { create } from 'zustand'

const useGameStore = create(() => ({
  game: null,
  myPlayerId: null,
  myRole: null,
  isMyTurn: false,
  validMoves: [],
}))

export default useGameStore
