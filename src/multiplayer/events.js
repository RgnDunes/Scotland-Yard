export const CLIENT_EVENTS = {
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  START_GAME: 'START_GAME',
  MAKE_MOVE: 'MAKE_MOVE',
  USE_BLACK_TICKET: 'USE_BLACK_TICKET',
  USE_DOUBLE_MOVE: 'USE_DOUBLE_MOVE',
  PASS_TURN: 'PASS_TURN',
  RECONNECT: 'RECONNECT',
}

export const SERVER_EVENTS = {
  ROOM_CREATED: 'room:created',
  ROOM_JOINED: 'room:joined',
  ROOM_UPDATED: 'room:updated',
  ROOM_ERROR: 'room:error',
  GAME_STARTED: 'game:started',
  GAME_STATE: 'game:state',
  GAME_REVEAL: 'game:reveal',
  GAME_OVER: 'game:over',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYER_RECONNECTED: 'player:reconnected',
  ERROR: 'error',
}
