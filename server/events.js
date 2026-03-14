module.exports = {
  CLIENT_EVENTS: {
    CREATE_ROOM: 'CREATE_ROOM',
    JOIN_ROOM: 'JOIN_ROOM',
    ASSIGN_ROLE: 'ASSIGN_ROLE',
    START_GAME: 'START_GAME',
    MAKE_MOVE: 'MAKE_MOVE',
  },
  SERVER_EVENTS: {
    ROOM_CREATED: 'room:created',
    ROOM_JOINED: 'room:joined',
    GAME_STARTED: 'game:started',
    GAME_STATE: 'game:state',
    GAME_OVER: 'game:over',
  },
}
