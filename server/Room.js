class Room {
  constructor(code) {
    this.code = code
    this.players = []
    this.game = null
    this.status = 'waiting'
    this.createdAt = Date.now()
  }
}

module.exports = Room
